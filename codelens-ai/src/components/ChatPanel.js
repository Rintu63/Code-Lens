/* ============================================================
   components/ChatPanel.js
   AI Chat Assistant — full chat UI powered by the Anthropic API.
   Renders into #chat-root inside #panel-chat.
   ============================================================ */

/** In-memory chat history for the Anthropic API call */
const _chatHistory = [];

/** System prompt given to the AI for context */
const SYSTEM_PROMPT = `You are CodeLens AI, an expert code review assistant embedded in a pull request analysis tool.

You have just finished reviewing PR #142 from the repo acme-corp/backend (branch: feat/user-profile-settings).

REVIEW FINDINGS:
- Bug (critical): Null pointer dereference at userController.js:47 — user?.profile?.settings not guarded
- Security (critical): SQL injection at queryBuilder.js:22 — string interpolation in raw SQL
- Performance (high): N+1 query at orderService.js:89 — fetch items inside a loop
- Performance (medium): Synchronous readFileSync in configLoader.js:14
- Performance (medium): Missing index on orders.userId in migration
- Code Smell (low): Magic number 3600 repeated 4× in session.js
- Bug (high): Off-by-one pagination offset at listController.js:33

Health score: 62/100 · Grade C

Your role:
- Explain issues clearly with code examples
- Suggest specific, correct fixes with full code
- Help developers understand WHY something is a problem
- Be concise, direct, and technically precise
- Use markdown formatting: bold, code blocks, bullet points
Keep replies under 300 words unless asked for more detail.`;

/**
 * Render the chat panel into #chat-root.
 */
function renderChatPanel() {
  const root = document.getElementById('chat-root');
  if (!root) return;

  root.innerHTML = `
    <div class="chat-wrap" role="region" aria-label="AI code review assistant chat">

      <!-- Messages area -->
      <div class="chat-messages" id="chat-messages" aria-live="polite" aria-label="Conversation">
        ${buildWelcomeMessage()}
      </div>

      <!-- Quick prompt chips -->
      <div class="chat-chips" id="chat-chips" role="group" aria-label="Quick prompts">
        ${(window.QUICK_PROMPTS || []).map(p => `
          <button class="chip" onclick="sendChatMessage('${escapeHtml(p.text)}')" title="${escapeHtml(p.text)}">
            ${escapeHtml(p.label)}
          </button>
        `).join('')}
      </div>

      <!-- Input row -->
      <div class="chat-input-row">
        <textarea
          class="chat-input"
          id="chat-input"
          placeholder="Ask anything about this PR…"
          rows="1"
          aria-label="Message input"
          onkeydown="handleChatKey(event)"
        ></textarea>
        <button class="chat-send-btn" onclick="submitChatInput()" aria-label="Send message">
          <i class="ti ti-send" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;
}

/* ── Welcome message ── */
function buildWelcomeMessage() {
  return `
    <div class="chat-msg ai">
      <div class="chat-avatar ai" aria-hidden="true">
        <i class="ti ti-robot" style="font-size:15px"></i>
      </div>
      <div>
        <div class="chat-bubble ai">
          <strong>👋 Hey! I'm CodeLens AI.</strong><br><br>
          I've finished reviewing <strong>PR #142</strong> and found
          <strong>7 issues</strong> — including 2 critical ones that should be fixed before merging.<br><br>
          Ask me to explain any issue, show you a fix, write tests, or draft a team summary.
          You can also tap a quick prompt below ↓
        </div>
        <div class="chat-time">${formatChatTime(new Date())}</div>
      </div>
    </div>
  `;
}

/* ── Keyboard handler — Enter sends, Shift+Enter newline ── */
function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitChatInput();
  }
}

/* ── Submit from input box ── */
function submitChatInput() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  sendChatMessage(text);
}

/**
 * Send a user message and get an AI reply.
 * Checks canned responses first; falls back to Anthropic API.
 * @param {string} text
 */
async function sendChatMessage(text) {
  if (!text.trim()) return;

  // Append user bubble
  appendMessage('user', text);

  // Show typing indicator
  const typingId = showTyping();

  // Check canned responses first (instant UX)
  const canned = findCannedResponse(text);
  if (canned) {
    await delay(600 + Math.random() * 400);
    removeTyping(typingId);
    appendMessage('ai', canned);
    return;
  }

  // Push to history for API
  _chatHistory.push({ role: 'user', content: text });

  try {
    const reply = await callAnthropicAPI(_chatHistory);
    removeTyping(typingId);
    _chatHistory.push({ role: 'assistant', content: reply });
    appendMessage('ai', reply);
  } catch (err) {
    removeTyping(typingId);
    appendMessage('ai', `⚠️ Could not reach the AI API: ${err.message}. Please check your connection.`);
  }
}

/* ── Anthropic API call ── */
async function callAnthropicAPI(history) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model      : 'claude-sonnet-4-20250514',
      max_tokens : 1000,
      system     : SYSTEM_PROMPT,
      messages   : history,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.content.map(b => b.text || '').join('');
}

/* ── Canned response matcher ── */
function findCannedResponse(text) {
  const lower = text.toLowerCase();
  const map   = window.CANNED_RESPONSES || {};
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return map[key];
  }
  return null;
}

/* ── Append a bubble to the messages list ── */
function appendMessage(role, text) {
  const list = document.getElementById('chat-messages');
  if (!list) return;

  const isAI = role === 'ai';
  const div  = document.createElement('div');
  div.className = `chat-msg ${role}`;

  const avatarIcon = isAI
    ? '<i class="ti ti-robot" style="font-size:15px"></i>'
    : '<i class="ti ti-user" style="font-size:14px"></i>';

  div.innerHTML = `
    ${isAI ? `<div class="chat-avatar ai" aria-hidden="true">${avatarIcon}</div>` : ''}
    <div>
      <div class="chat-bubble ${role}">${renderMarkdownLite(text)}</div>
      <div class="chat-time">${formatChatTime(new Date())}</div>
    </div>
    ${!isAI ? `<div class="chat-avatar user" aria-hidden="true">${avatarIcon}</div>` : ''}
  `;

  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
}

/* ── Show typing indicator; returns unique id ── */
function showTyping() {
  const list = document.getElementById('chat-messages');
  if (!list) return null;
  const id  = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id    = id;
  div.className = 'chat-msg ai';
  div.innerHTML = `
    <div class="chat-avatar ai" aria-hidden="true"><i class="ti ti-robot" style="font-size:15px"></i></div>
    <div class="chat-bubble ai">
      <div class="typing-indicator" aria-label="AI is typing">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  list.appendChild(div);
  list.scrollTop = list.scrollHeight;
  return id;
}

function removeTyping(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ── Lite markdown renderer (bold, code, pre, bullets) ── */
function renderMarkdownLite(text) {
  return escapeHtml(text)
    // code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // headers
    .replace(/^### (.+)$/gm, '<strong style="font-size:13px">$1</strong>')
    .replace(/^## (.+)$/gm,  '<strong>$1</strong>')
    // bullet points
    .replace(/^[-•] (.+)$/gm, '<span style="display:block;padding-left:.5rem">• $1</span>')
    // line breaks
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

/* ── Helpers ── */
function formatChatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
