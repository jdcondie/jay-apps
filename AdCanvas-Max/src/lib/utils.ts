import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HistoryItem, AdTemplate } from '../../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HISTORY_KEY = 'ad_generator_history';

export function saveToHistory(item: HistoryItem) {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    history.unshift(item);
    // Limit to 20 items to avoid localStorage quota limits (base64 images are large)
    const limitedHistory = history.slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save to history (likely quota exceeded):', error);
    // If it fails, try to save a smaller version or just the last few
    try {
      const history = getHistory();
      history.unshift(item);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
    } catch (e) {
      console.error('Critical failure saving to localStorage:', e);
    }
  }
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

export function clearHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

// ─── Custom Templates ────────────────────────────────────────────────────────

const TEMPLATES_KEY = 'custom_ad_templates';

export function getCustomTemplates(): AdTemplate[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TEMPLATES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCustomTemplate(template: AdTemplate): void {
  if (typeof window === 'undefined') return;
  const templates = getCustomTemplates();
  templates.unshift(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteCustomTemplate(id: string): void {
  if (typeof window === 'undefined') return;
  const templates = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// Convert a public image URL to base64 (used for built-in template references)
export async function urlToBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const [meta, data] = dataUrl.split(',');
      const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
      resolve({ data, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
