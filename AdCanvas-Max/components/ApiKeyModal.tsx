import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../src/lib/apiKeyStore';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keyInput, setKeyInput] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasExistingKey(!!getStoredApiKey());
      setKeyInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    setStoredApiKey(trimmed);
    onClose();
  };

  const handleClear = () => {
    clearStoredApiKey();
    setHasExistingKey(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8541A]/10 rounded-xl flex items-center justify-center text-[#E8541A]">
              <Key size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111]">Connect Gemini API Key</h2>
              <p className="text-xs text-[#717171]">Stored locally in your browser only.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#717171] hover:text-[#111111]">
            <X size={18} />
          </button>
        </div>

        {hasExistingKey && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <span className="text-xs text-green-900 font-semibold">A key is already saved.</span>
            <button
              onClick={handleClear}
              className="text-xs text-red-600 font-bold hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
          {hasExistingKey ? 'Replace with a new key' : 'Paste your key'}
        </label>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          placeholder="AIza..."
          className="w-full px-3 py-2.5 border border-[#d4d4d4] rounded-lg text-sm font-mono focus:outline-none focus:border-[#E8541A]"
          autoFocus
        />

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-xs text-[#E8541A] font-semibold hover:underline"
        >
          Get a free Gemini key <ExternalLink size={12} />
        </a>

        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#717171] hover:text-[#111111]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!keyInput.trim()}
            className="bg-[#E8541A] text-white px-5 py-2 rounded-lg font-bold text-xs hover:bg-[var(--brand-orange-mid)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Key
          </button>
        </div>

        <p className="mt-4 text-[10px] text-[#717171] leading-relaxed">
          Your key never leaves this browser. It's used to call Gemini directly from your session and is stored only in localStorage.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
