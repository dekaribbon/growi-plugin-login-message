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

function createMessageElement(content: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.id = 'growi-plugin-login-message';

  const inner = document.createElement('div');
  inner.className = 'growi-login-message-content';

  const lines = content.split('\n');
  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line;
    inner.appendChild(p);
  }

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
      text-align: center;
    }
    #growi-plugin-login-message .growi-login-message-content p {
      margin: 4px 0;
      padding: 0;
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
    .then((content) => {
      const el = createMessageElement(content);
      messageElement = el;
      const loginForm =
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
