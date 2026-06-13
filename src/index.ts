import { marked } from 'marked';
import DOMPurify from 'dompurify';

const CONFIG_PAGE_PATH = '/plugin/login-message';
const DEFAULT_MESSAGE =
  'Welcome to our wiki! Please log in to access content.';

const LOGIN_PATH_PATTERNS = ['/login', '/register', '/forgot-password'];

let observer: MutationObserver | null = null;
let messageElement: HTMLElement | null = null;
let isLoading = false;

function isLoginPage(): boolean {
  const path = window.location.pathname;
  return LOGIN_PATH_PATTERNS.some(
    (pattern) => path === pattern || path.startsWith(pattern + '/'),
  );
}

async function fetchMessageContent(): Promise<string> {
  try {
    const res = await fetch(
      `/_api/v3/page?path=${encodeURIComponent(CONFIG_PAGE_PATH)}`,
      { credentials: 'include' },
    );
    if (!res.ok) return DEFAULT_MESSAGE;
    const data = await res.json();
    const body = data?.page?.revision?.body;
    if (body && typeof body === 'string' && body.trim().length > 0) {
      return body.trim();
    }
    return DEFAULT_MESSAGE;
  } catch {
    return DEFAULT_MESSAGE;
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function renderMarkdown(content: string): Promise<string> {
  try {
    const rawHtml = await marked.parse(content);
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'a',
        'ul', 'ol', 'li', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'del', 'ins', 'sub', 'sup',
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }
  catch {
    const lines = content.split('\n');
    return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  }
}

async function createMessageElement(content: string): Promise<HTMLElement> {
  const wrapper = document.createElement('div');
  wrapper.id = 'growi-plugin-login-message';

  const inner = document.createElement('div');
  inner.className = 'growi-login-message-content';

  const html = await renderMarkdown(content);
  inner.innerHTML = html;

  wrapper.appendChild(inner);
  return wrapper;
}

const STYLE_ID = 'growi-plugin-login-message-style';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #growi-plugin-login-message {
      width: 100%;
      max-width: 520px;
      margin: 0 auto 24px auto;
      padding: 16px 20px;
      border-radius: 8px;
      background: #f0f7ff;
      border: 1px solid #b3d4ff;
      box-sizing: border-box;
    }
    #growi-plugin-login-message .growi-login-message-content {
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
    }
    #growi-plugin-login-message .growi-login-message-content p {
      margin: 4px 0;
    }
    #growi-plugin-login-message .growi-login-message-content a {
      color: #1a73e8 !important;
      text-decoration: underline !important;
    }
    #growi-plugin-login-message .growi-login-message-content ul,
    #growi-plugin-login-message .growi-login-message-content ol {
      margin: 4px 0;
      padding-left: 24px;
    }
    #growi-plugin-login-message .growi-login-message-content code {
      background: rgba(0,0,0,0.06);
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 13px;
    }
    #growi-plugin-login-message .growi-login-message-content pre {
      background: rgba(0,0,0,0.06);
      padding: 8px 12px;
      border-radius: 4px;
      overflow-x: auto;
    }
    #growi-plugin-login-message .growi-login-message-content pre code {
      background: none;
      padding: 0;
    }
    #growi-plugin-login-message .growi-login-message-content blockquote {
      margin: 4px 0;
      padding: 4px 12px;
      border-left: 3px solid #b3d4ff;
      color: #555;
    }
    #growi-plugin-login-message .growi-login-message-content h1,
    #growi-plugin-login-message .growi-login-message-content h2,
    #growi-plugin-login-message .growi-login-message-content h3,
    #growi-plugin-login-message .growi-login-message-content h4,
    #growi-plugin-login-message .growi-login-message-content h5,
    #growi-plugin-login-message .growi-login-message-content h6 {
      margin: 8px 0 4px 0;
      font-weight: 600;
    }
    #growi-plugin-login-message .growi-login-message-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 4px 0;
    }
    #growi-plugin-login-message .growi-login-message-content th,
    #growi-plugin-login-message .growi-login-message-content td {
      border: 1px solid #d0d7de;
      padding: 4px 8px;
      text-align: left;
    }
    #growi-plugin-login-message .growi-login-message-content th {
      background: rgba(0,0,0,0.04);
    }
    #growi-plugin-login-message .growi-login-message-content hr {
      border: none;
      border-top: 1px solid #d0d7de;
      margin: 8px 0;
    }
  `;
  document.head.appendChild(style);
}

function injectMessage(): void {
  if (!isLoginPage()) return;
  if (document.getElementById('growi-plugin-login-message')) return;
  if (isLoading) return;
  isLoading = true;
  removeMessage();
  injectStyles();
  fetchMessageContent()
    .then(async (content) => {
      const el = await createMessageElement(content);
      messageElement = el;
      const loginForm =
        document.querySelector('.nologin-header') ||
        document.querySelector('.noLogin-form-errors') ||
        document.querySelector('.login-form') ||
        document.querySelector('form[action*="login"]') ||
        document.querySelector('.nologin') ||
        document.querySelector('.col-md-4') ||
        document.querySelector('.col-md-6');
      if (loginForm?.parentElement) {
        loginForm.parentElement.insertBefore(el, loginForm);
      } else {
        const main =
          document.querySelector('main') ||
          document.querySelector('#main') ||
          document.querySelector('.main') ||
          document.body;
        main.insertBefore(el, main.firstChild);
      }
    })
    .finally(() => {
      isLoading = false;
    });
}

function removeMessage(): void {
  document.getElementById('growi-plugin-login-message')?.remove();
  messageElement = null;
}

function startObserver(): void {
  observer = new MutationObserver(() => {
    if (isLoginPage() && !document.getElementById('growi-plugin-login-message')) {
      injectMessage();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver(): void {
  observer?.disconnect();
  observer = null;
}

export function activate(): void {
  injectMessage();
  startObserver();
}

export function deactivate(): void {
  stopObserver();
  removeMessage();
  document.getElementById(STYLE_ID)?.remove();
}
