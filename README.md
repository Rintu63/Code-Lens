# CodeLens AI

CodeLens AI is a production-minded pull request review workspace that combines a rich, analyst-style front-end with an AI-assisted review backend. It helps teams evaluate pull request quality, surface risks quickly, and explore review insights without leaving a single dashboard.

## Overview

CodeLens AI is designed for engineering teams that want a clear, actionable view of PR health. The application delivers:

- **AI-assisted code review workflow** for pasted code, uploaded files, and GitHub PR URLs
- **Interactive review dashboard** with metrics, issue triage, diff inspection, and score visualization
- **Operational insights** such as CI/CD, dependency scanning, ownership, velocity, rubric review, and activity timelines
- **Developer tooling** including auto-fix suggestions, rule management, chat assistance, and webhook simulation

This project is intentionally structured as a **static frontend + API backend**, making it easy to run locally, extend incrementally, and embed in other workflows.

## Why it exists

The product is built to reduce the time between “I need to review this change” and “I understand the risks.” It is optimized for:

- **Fast review cycles** for distributed engineering teams
- **Better signal quality** by prioritizing security, correctness, and maintainability issues
- **Developer ergonomics** with concise, actionable recommendations and visual summaries
- **Modular extensibility** so new panels, review rules, and provider integrations can be added cleanly

## System architecture

### Frontend

The UI is a static browser application served from `index.html` and rendered by `src/app.js`. It composes a set of reusable components from `src/components/` and consumes local mock data files from `src/data/`.

Key parts:

- `index.html` — application shell and script loading order
- `src/app.js` — bootstrap and component orchestration
- `src/components/` — panel components and dashboard widgets
- `src/styles/` — design system and responsive layout styles
- `src/utils/` — helper utilities, animations, toast notifications, export logic, and keyboard shortcuts

### Backend

The backend is a FastAPI service in `server.py` that provides the review API and health check endpoint.

Key responsibilities:

- Accept review requests for uploaded code, pasted snippets, or GitHub PR patch URLs
- Infer language where possible and build provider prompts
- Call an LLM provider and parse structured JSON output
- Fall back to local heuristic checks when provider access is unavailable

### Data flow

1. The browser loads the static UI and mounts each panel.
2. The user submits code or a GitHub PR URL.
3. The frontend calls the backend API at `/api/review`.
4. The backend fetches patch content if needed, constructs a review prompt, and sends it to the configured provider.
5. Results are rendered in the dashboard with severity, location, snippet, and remediation guidance.

## Features

### Review and inspection

- Submit pasted code, uploaded files, or GitHub pull request links
- Inspect diff context, issue cards, metrics, and health scores
- Review security, bug, performance, and maintainability findings

### Developer workflows

- Chat-assisted review guidance
- Auto-fix suggestions and remediation hints
- Rule management for organization-specific review policy
- Webhook simulation for review event workflows

### Team and quality dashboards

- Agent and ownership insights
- CI/CD health tracking
- Dependency scanning
- Velocity, rubric, and checklist panels
- Activity feed and comparison views

## Project structure

```text
.
├── index.html                 # Static app shell
├── server.py                  # FastAPI review API
├── requirements.txt           # Python dependencies
├── .env.example                # Environment variable template
├── public/                     # Static assets
├── src/
│   ├── app.js                  # UI bootstrap
│   ├── components/             # UI panels and widgets
│   ├── data/                   # Demo and seed data
│   ├── styles/                 # CSS files
│   └── utils/                  # Shared helpers and integrations
```

## Local development

### Prerequisites

- Python 3.10+
- A configured provider credential for either:
  - `OPENAI_API_KEY` for OpenAI-compatible providers, or
  - `GITHUB_COPILOT_API_KEY` for GitHub Copilot

### 1. Create and activate the virtual environment

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

If you are on macOS or Linux, use:

```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and set the provider settings you want to use.

```bash
copy .env.example .env
```

Recommended defaults:

```env
AI_PROVIDER=github-copilot
GITHUB_COPILOT_API_KEY=your-key
GITHUB_COPILOT_BASE_URL=https://api.githubcopilot.com
GITHUB_COPILOT_MODEL=gpt-4.1-mini
APP_HOST=0.0.0.0
APP_PORT=8000
```

### 4. Start the API

```bash
python server.py
```

### 5. Open the UI

Since the frontend is static, you can open `index.html` directly in your browser or serve it with a simple static file server.

Example using Python:

```bash
python -m http.server 8001
```

Then visit:

- `http://localhost:8001`
- `http://localhost:8000/health` for the backend health check

## API reference

### Health check

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "CodeLens Review API"
}
```

### Review submission

```http
POST /api/review
Content-Type: application/json
```

Example payload:

```json
{
  "source_type": "uploaded",
  "input": "const total = users.reduce((acc, user) => acc + user.age, 0);",
  "language": "js",
  "filename": "example.js"
}
```

Expected response shape:

```json
{
  "provider": "github-copilot",
  "model": "gpt-4.1-mini",
  "source_type": "uploaded",
  "label": "example.js",
  "issues": [
    {
      "type": "bug",
      "severity": "high",
      "title": "Potential null access",
      "description": "The code assumes the input always contains the expected structure.",
      "file": "example.js",
      "line": 1,
      "code": [
        {
          "line": 1,
          "text": "const total = users.reduce((acc, user) => acc + user.age, 0);",
          "highlight": true
        }
      ],
      "fix": "Validate the input shape before reduction and guard against missing values."
    }
  ],
  "summary": {
    "issue_count": 1,
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0
  },
  "fallback": false
}
```

## Configuration

### Supported providers

The backend reads the following environment variables:

- `AI_PROVIDER` — `openai` or `github-copilot`
- `OPENAI_API_KEY` — API key for an OpenAI-compatible provider
- `OPENAI_BASE_URL` — optional OpenAI-compatible base URL
- `OPENAI_MODEL` — optional model override
- `GITHUB_COPILOT_API_KEY` — GitHub Copilot API key
- `GITHUB_COPILOT_BASE_URL` — optional GitHub Copilot base URL
- `GITHUB_COPILOT_MODEL` — optional model override
- `APP_HOST` — bind host
- `APP_PORT` — bind port

### Fallback behavior

If the configured provider is unavailable or returns malformed output, the server uses a local heuristic fallback to continue returning useful review findings.

## Testing and quality

This repository does not currently include a formal test runner or CI pipeline, but the codebase is structured to support quality improvements in a predictable way:

- Keep UI logic modular and component-oriented
- Validate API payloads with Pydantic models
- Prefer explicit error handling around provider calls
- Add regression tests for review parsing, fallback behavior, and new dashboard panels

Recommended follow-up improvements:

- Add a test suite for `server.py` using `pytest`
- Add front-end smoke tests for critical rendering flows
- Add CI jobs for linting, dependency updates, and API health checks
- Introduce contract tests for review payload schema changes

## Security and reliability notes

- CORS is enabled for development convenience and should be restricted for production deployments.
- Provider secrets should never be committed to source control.
- The backend should be deployed behind authentication and TLS when exposed publicly.
- Use a dedicated environment configuration for staging and production.

## Contributing

Contributions are welcome. A strong contributor workflow looks like this:

1. Create a focused branch for the change
2. Keep changes small, readable, and easy to review
3. Update documentation when behavior changes
4. Validate local behavior before opening a pull request
5. Prefer clear naming, typed interfaces, and well-scoped components

If you are adding a new panel or review capability, keep the implementation aligned with the existing component and data patterns used throughout the UI.

## Roadmap

Potential next steps for the project:

- Add a real persistence layer for review history
- Support additional providers and model routing
- Introduce authenticated deployment configuration
- Add automated tests and end-to-end validation
- Expand review heuristics for language-specific analysis

## Contact

For questions, improvements, or integration work, use the repository issues or open a pull request with a clear summary and implementation notes.
