import os
import re
import json
import asyncio
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CodeLens Review API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReviewRequest(BaseModel):
    source_type: str = Field(default="uploaded", description="uploaded, pasted, or github")
    input: str
    language: str | None = None
    target: str | None = None
    filename: str | None = None


class ReviewResponse(BaseModel):
    provider: str
    model: str
    source_type: str
    label: str
    issues: list[dict[str, Any]]
    summary: dict[str, Any]
    fallback: bool = False


def infer_language_from_filename(filename: str | None) -> str | None:
    if not filename:
        return None

    suffix = os.path.splitext(filename.lower())[1]
    language_map = {
        ".py": "py",
        ".js": "js",
        ".jsx": "jsx",
        ".ts": "ts",
        ".tsx": "tsx",
        ".java": "java",
        ".go": "go",
        ".rs": "rs",
        ".cs": "cs",
        ".c": "c",
        ".cpp": "cpp",
        ".hpp": "hpp",
        ".h": "c",
        ".txt": "txt",
        ".md": "md",
    }

    return language_map.get(suffix)


def get_review_label(request: ReviewRequest) -> str:
    if request.source_type == "github":
        return request.input
    if request.source_type == "uploaded" and request.filename:
        return request.filename
    if request.source_type == "uploaded":
        return "uploaded-code"
    return "pasted-code"


def get_provider_config() -> tuple[str, str, str, str]:
    provider = os.getenv("AI_PROVIDER", "github-copilot").strip().lower()
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
        return provider, api_key, base_url, model

    api_key = os.getenv("GITHUB_COPILOT_API_KEY", "").strip()
    base_url = os.getenv("GITHUB_COPILOT_BASE_URL", "https://api.githubcopilot.com").rstrip("/")
    model = os.getenv("GITHUB_COPILOT_MODEL", "gpt-4.1-mini").strip()
    return "github-copilot", api_key, base_url, model


async def fetch_github_patch(input_value: str) -> str:
    match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", input_value, re.IGNORECASE)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub PR URL")

    owner, repo, pr_number = match.groups()
    patch_url = f"https://patch-diff.githubusercontent.com/raw/{owner}/{repo}/pull/{pr_number}.patch"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(patch_url)
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="Failed to fetch GitHub patch")
        return response.text


def build_review_prompt(source_type: str, input_value: str, language: str | None) -> str:
    language_hint = language or "generic"
    return f"""You are a production-grade code review assistant for a hackathon project.

Goal:
- Detect security, bug, performance, and maintainability issues.
- For each issue, provide a clear title, description, file location, severity, a compact code snippet, and a concrete fix suggestion.
- Prioritize issues that could break production or impact user safety.
- If the input is a GitHub PR patch, infer the affected files and review the diff.
- Do not mention that you are using a fallback or local heuristic unless necessary.

Return ONLY valid JSON in the following format:

{{
  "issues": [
    {{
      "type": "bug|security|performance|smell",
      "severity": "critical|high|medium|low",
      "title": "...",
      "description": "...",
      "file": "path/to/file.ext",
      "line": 1,
      "code": [{{"line": 1, "text": "...", "highlight": true}}],
      "fix": "..."
    }}
  ]
}}

Use the source type and input below.

Source type: {source_type}
Language: {language_hint}

Input:
{input_value}
"""


def extract_json_payload(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse provider response JSON")


def local_fallback_issues(source_type: str, input_value: str, filename: str | None, language: str | None) -> list[dict[str, Any]]:
    text = input_value
    lines = text.splitlines()
    issues = []

    def add_issue(issue: dict[str, Any]) -> None:
        if issue not in issues:
            issues.append(issue)

    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if source_type == "github":
            file_name = "github-patch.diff"
        elif filename:
            file_name = filename
        else:
            file_name = f"uploaded-source.{language or 'txt'}"

        if re.search(r"eval\s*\(|new Function\s*\(", stripped):
            add_issue(
                {
                    "type": "security",
                    "severity": "critical",
                    "title": "Dangerous dynamic code execution",
                    "description": "Dynamic evaluation can execute arbitrary code and is unsafe when user-controlled input is involved.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Replace eval/new Function with explicit parsing logic or a safe whitelist-based parser.",
                }
            )
        if "innerHTML" in stripped or "document.write(" in stripped:
            add_issue(
                {
                    "type": "security",
                    "severity": "critical",
                    "title": "Unsafe DOM injection path",
                    "description": "Writing untrusted HTML directly into the DOM can expose the app to cross-site scripting.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Escape or sanitize untrusted input before writing it to the DOM and prefer textContent when possible.",
                }
            )
        if re.search(r"readFileSync\s*\(|openSync\s*\(", stripped):
            add_issue(
                {
                    "type": "performance",
                    "severity": "high",
                    "title": "Blocking synchronous file I/O",
                    "description": "Synchronous file operations block the event loop and reduce throughput under load.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Use async file APIs or load the data once at startup instead of reading it synchronously inside request flow.",
                }
            )
        if re.search(r"page\s*\*\s*limit|offset\s*=\s*page\s*\*\s*limit", stripped):
            add_issue(
                {
                    "type": "bug",
                    "severity": "high",
                    "title": "Pagination offset bug",
                    "description": "The offset calculation skips the first page of results, which leads to missing records.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Use (page - 1) * limit instead of page * limit.",
                }
            )

        if re.search(r"\.profile\.|\buser\b", stripped) and "?.profile" not in stripped and "user?" not in stripped:
            add_issue(
                {
                    "type": "bug",
                    "severity": "high",
                    "title": "Possible null dereference on user profile access",
                    "description": "The code reads nested user fields without checking whether the user object is defined.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Guard the user value before reading nested fields or use optional chaining with a safe fallback.",
                }
            )

        if re.search(r"\b(3600|86400|604800|1000|60000)\b", stripped):
            add_issue(
                {
                    "type": "smell",
                    "severity": "low",
                    "title": "Magic number should be named constant",
                    "description": "A hard-coded timeout constant makes the code harder to maintain and more error-prone.",
                    "file": file_name,
                    "line": idx,
                    "code": [{"line": idx, "text": line, "highlight": True}],
                    "fix": "Replace the raw literal with a named constant such as SESSION_TTL_SECONDS or MAX_RETRY_DELAY.",
                }
            )

    return issues


async def call_provider(prompt: str, provider: str, api_key: str, base_url: str, model: str) -> str:
    if not api_key:
        raise HTTPException(status_code=503, detail=f"{provider} API key is not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    if provider == "github-copilot":
        headers.update(
            {
                "Editor": "vscode",
                "Copilot-Integration-Id": "vscode-chat",
                "X-GitHub-Api-Version": "2022-11-28",
            }
        )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a strict code review assistant that returns valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1800,
    }

    endpoint = f"{base_url.rstrip('/')}/chat/completions"
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(endpoint, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    try:
        return data["choices"][0]["message"]["content"]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Unexpected provider response: {exc}") from exc


async def review_payload(request: ReviewRequest) -> ReviewResponse:
    source_type = request.source_type.lower()
    if source_type == "github":
        payload_input = await fetch_github_patch(request.input)
    else:
        payload_input = request.input

    label = get_review_label(request)
    resolved_language = request.language or infer_language_from_filename(request.filename)

    provider, api_key, base_url, model = get_provider_config()
    prompt = build_review_prompt(source_type, payload_input, resolved_language)

    fallback = False
    issues: list[dict[str, Any]] = []

    try:
        raw_text = await call_provider(prompt, provider, api_key, base_url, model)
        review_json = extract_json_payload(raw_text)
        issues = review_json.get("issues", [])
        if not isinstance(issues, list):
            raise ValueError("Provider issues payload is not a list")
    except Exception:
        fallback = True
        issues = local_fallback_issues(source_type, payload_input, request.filename, resolved_language)

    summary = {
        "issue_count": len(issues),
        "critical": sum(1 for issue in issues if issue.get("severity") == "critical"),
        "high": sum(1 for issue in issues if issue.get("severity") == "high"),
        "medium": sum(1 for issue in issues if issue.get("severity") == "medium"),
        "low": sum(1 for issue in issues if issue.get("severity") == "low"),
    }

    return ReviewResponse(
        provider=provider,
        model=model,
        source_type=source_type,
        label=label,
        issues=issues,
        summary=summary,
        fallback=fallback,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "CodeLens Review API"}


@app.post("/api/review", response_model=ReviewResponse)
async def review(request: ReviewRequest) -> ReviewResponse:
    try:
        return await review_payload(request)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    import uvicorn

    uvicorn.run("server:app", host=host, port=port, reload=False)
