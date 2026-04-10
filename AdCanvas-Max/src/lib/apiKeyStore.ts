// Client-side storage for a user-provided Gemini API key.
// Keys live only in localStorage on the user's own browser and never transit our infra.

const STORAGE_KEY = 'ad_canvas_gemini_api_key';
const EVENT_NAME = 'ad_canvas_api_key_changed';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // localStorage unavailable (private mode, etc.) — swallow silently.
  }
}

export function clearStoredApiKey(): void {
  setStoredApiKey('');
}

export function onApiKeyChange(handler: () => void): () => void {
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
