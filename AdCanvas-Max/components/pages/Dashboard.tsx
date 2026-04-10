import React, { useState, useEffect, useCallback } from 'react';
import {
  Image, LayoutTemplate, Sparkles, Plus, Upload,
  Globe, Lightbulb, Crosshair, Users, Target, TrendingUp,
  CheckCircle2, Loader2, X, Edit2, Check, Trash2, Link,
  RefreshCw, AlertCircle, ShoppingBag, MapPin, DollarSign,
  MessageSquare, Hash, ShoppingCart, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { extractBrandFromUrl, extractDomainName } from '../../services/brandExtractor';
import type { ExtractedBrandData, DetailedAudienceProfile } from '../../services/brandExtractor';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BrandData extends ExtractedBrandData {}

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  impressions: string;
  clicks: string;
  ctr: string;
}

interface StoreConnection {
  url: string;
  connected: boolean;
  storeName: string;
  lastSync: string | null;
}

// ─── localStorage helpers ──────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_BRAND: BrandData = {
  name: 'My Brand',
  description: '',
  colors: ['#E8541A', '#111111', '#717171', '#ffffff'],
  logoUrl: null,
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Inter',
  toneKeywords: [],
};

const PRESET_COLORS = [
  '#E8541A', '#F97440', '#EF4444', '#F59E0B',
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#111111', '#444444', '#717171', '#ffffff',
];

// ─── Inline editable field ─────────────────────────────────────────────────────
const EditableField: React.FC<{
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}> = ({ value, onSave, placeholder, className, multiline }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => { onSave(draft); setEditing(false); };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className={`group flex items-center gap-1.5 text-left w-full ${className}`}>
        <span className={value ? '' : 'text-[#717171]/50 italic text-xs'}>{value || placeholder}</span>
        <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 text-[#717171]" />
      </button>
    );
  }
  return multiline ? (
    <div className="flex flex-col gap-1 w-full">
      <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
        placeholder={placeholder}
        className="w-full bg-[#fafafa] border border-[#E8541A] rounded-lg py-1.5 px-3 text-sm focus:outline-none resize-none" />
      <div className="flex gap-1">
        <button onClick={commit} className="text-[10px] font-bold text-[#E8541A] hover:underline">Save</button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-[10px] font-bold text-[#717171] hover:underline">Cancel</button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-1 w-full">
      <input autoFocus type="text" value={draft} placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className="flex-1 bg-[#fafafa] border border-[#E8541A] rounded-lg py-1 px-3 text-sm focus:outline-none min-w-0" />
      <button onClick={commit} className="w-6 h-6 bg-[#E8541A] text-white rounded-md flex items-center justify-center hover:bg-[#F97440] shrink-0">
        <Check size={12} />
      </button>
    </div>
  );
};

// ─── Color Swatch ──────────────────────────────────────────────────────────────
const ColorSwatch: React.FC<{ color: string; onChange: (c: string) => void; onRemove: () => void }> = ({ color, onChange, onRemove }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg border border-[#d4d4d4] shadow-sm hover:scale-110 transition-transform relative group"
        style={{ backgroundColor: color }}>
        <span className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/10 transition-colors" />
      </button>
      {open && (
        <div className="absolute z-50 top-10 left-0 bg-white border border-[#d4d4d4] rounded-xl shadow-xl p-3 w-48">
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {PRESET_COLORS.map((c) => (
              <button key={c} onClick={() => { onChange(c); setOpen(false); }}
                className="w-8 h-8 rounded-md border border-[#d4d4d4] hover:scale-110 transition-transform"
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <input type="color" value={color} onChange={(e) => onChange(e.target.value)}
            className="w-full h-7 rounded border border-[#d4d4d4] cursor-pointer mb-2" />
          <p className="text-[10px] font-mono text-[#717171] text-center mb-1">{color}</p>
          <button onClick={() => { onRemove(); setOpen(false); }}
            className="w-full text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 py-1 rounded-lg transition-colors">
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Store Connect Widget ──────────────────────────────────────────────────────
const StoreConnectWidget: React.FC<{
  store: StoreConnection;
  onConnect: (s: StoreConnection) => void;
  onExtracted: (result: Awaited<ReturnType<typeof extractBrandFromUrl>>) => void;
}> = ({ store, onConnect, onExtracted }) => {
  const [urlDraft, setUrlDraft] = useState(store.url);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');

  const STEPS = [
    'Fetching store page...',
    'Extracting color palette...',
    'Pulling brand assets...',
    'Generating buyer profiles with AI...',
    'Building workspace...',
  ];

  const handleFetch = async () => {
    const url = urlDraft.trim();
    if (!url) { setError('Enter a store URL first.'); return; }
    setError('');
    setLoading(true);

    // Step through loading messages
    let stepIdx = 0;
    setLoadingStep(STEPS[0]);
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setLoadingStep(STEPS[stepIdx]);
    }, 1200);

    try {
      const result = await extractBrandFromUrl(url);
      clearInterval(stepTimer);
      const storeName = result.brand.name || extractDomainName(url);
      onConnect({ url, connected: true, storeName, lastSync: new Date().toLocaleString() });
      onExtracted(result);
    } catch (e) {
      clearInterval(stepTimer);
      setError('Extraction failed. Check the URL and try again.');
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleResync = async () => {
    setError('');
    setLoading(true);
    let stepIdx = 0;
    setLoadingStep(STEPS[0]);
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, STEPS.length - 1);
      setLoadingStep(STEPS[stepIdx]);
    }, 1200);
    try {
      const result = await extractBrandFromUrl(store.url);
      clearInterval(stepTimer);
      onConnect({ ...store, lastSync: new Date().toLocaleString() });
      onExtracted(result);
    } catch {
      clearInterval(stepTimer);
      setError('Re-sync failed.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (store.connected) {
    return (
      <div className="bg-white border border-[#d4d4d4] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              {loading ? <Loader2 size={18} className="text-[#E8541A] animate-spin" /> : <CheckCircle2 size={20} className="text-green-500" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111111]">{store.storeName} — Connected</p>
              <p className="text-[11px] text-[#717171]">
                {loading ? loadingStep : `${store.url} · Last synced ${store.lastSync}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleResync} disabled={loading}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#717171] hover:text-[#111111] border border-[#d4d4d4] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Re-sync
            </button>
            <button onClick={() => onConnect({ url: '', connected: false, storeName: '', lastSync: null })}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
              Disconnect
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d4d4d4] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E8541A]/10 rounded-lg flex items-center justify-center">
            <Link size={15} className="text-[#E8541A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Auto-fill workspace</p>
            <h3 className="text-sm font-bold text-[#111111]">Connect Your Store</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-1 rounded-full">Shopify</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-1 rounded-full">WooCommerce</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-1 rounded-full">Any URL</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎨', label: 'Color palette', sub: 'Extracted from CSS' },
            { icon: '👤', label: 'Buyer profiles', sub: 'AI-generated' },
            { icon: '🖼', label: 'Brand assets', sub: 'From og:image' },
          ].map((item) => (
            <div key={item.label} className="bg-[#fafafa] border border-[#d4d4d4] rounded-xl p-3">
              <p className="text-lg mb-0.5">{item.icon}</p>
              <p className="text-[11px] font-bold text-[#111111]">{item.label}</p>
              <p className="text-[10px] text-[#717171]">{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717171]" />
            <input type="text" value={urlDraft}
              onChange={(e) => { setUrlDraft(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://yourstore.myshopify.com"
              className="w-full bg-[#fafafa] border border-[#d4d4d4] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#E8541A] focus:ring-2 focus:ring-[#E8541A]/10 transition-all" />
          </div>
          <button onClick={handleFetch} disabled={loading}
            className="flex items-center gap-2 bg-[#E8541A] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F97440] transition-all disabled:opacity-60 shadow-lg shadow-orange-500/20 whitespace-nowrap">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {loading ? loadingStep.split('...')[0] + '...' : 'Extract Brand'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
      </div>
    </div>
  );
};

// ─── Brand Setup Widget ────────────────────────────────────────────────────────
const BrandSetupWidget: React.FC<{ data: BrandData; onChange: (d: BrandData) => void }> = ({ data, onChange }) => {
  return (
    <div className="bg-white border border-[#d4d4d4] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#E8541A]/10 rounded-lg flex items-center justify-center">
          <Globe size={15} className="text-[#E8541A]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Brand</p>
          <h3 className="text-sm font-bold text-[#111111]">Brand Setup</h3>
        </div>
        {data.logoUrl && (
          <img src={data.logoUrl} alt="Logo" className="ml-auto w-8 h-8 object-contain rounded border border-[#d4d4d4]" referrerPolicy="no-referrer" />
        )}
      </div>
      <div className="p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Brand Name</label>
          <EditableField value={data.name} onSave={(v) => onChange({ ...data, name: v })}
            placeholder="Enter brand name..." className="text-sm font-semibold text-[#111111]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Description</label>
          <EditableField value={data.description} onSave={(v) => onChange({ ...data, description: v })}
            placeholder="Enter brand description..." className="text-xs text-[#717171]" multiline />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Color Palette</label>
          <div className="flex items-center gap-2 flex-wrap">
            {data.colors.map((color, i) => (
              <ColorSwatch key={i} color={color}
                onChange={(c) => onChange({ ...data, colors: data.colors.map((x, idx) => idx === i ? c : x) })}
                onRemove={() => onChange({ ...data, colors: data.colors.filter((_, idx) => idx !== i) })} />
            ))}
            <button onClick={() => onChange({ ...data, colors: [...data.colors, '#cccccc'] })}
              className="w-8 h-8 rounded-lg border-2 border-dashed border-[#d4d4d4] flex items-center justify-center text-[#717171] hover:border-[#E8541A] hover:text-[#E8541A] transition-colors">
              <Plus size={13} />
            </button>
          </div>
          {/* Hex codes row */}
          <div className="flex gap-1.5 flex-wrap mt-1">
            {data.colors.map((c, i) => (
              <span key={i} className="text-[9px] font-mono text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-1.5 py-0.5 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Heading Font</label>
            <EditableField value={data.headingFont} onSave={(v) => onChange({ ...data, headingFont: v })}
              placeholder="e.g. Montserrat" className="text-sm text-[#111111]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Body Font</label>
            <EditableField value={data.bodyFont} onSave={(v) => onChange({ ...data, bodyFont: v })}
              placeholder="e.g. Inter" className="text-sm text-[#111111]" />
          </div>
        </div>
        {data.toneKeywords?.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Tone Keywords</label>
            <div className="flex flex-wrap gap-1.5">
              {data.toneKeywords.map((kw, i) => (
                <span key={i} className="text-[10px] font-bold text-[#E8541A] bg-[#E8541A]/10 px-2.5 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Audience Profile Card ─────────────────────────────────────────────────────
const AudienceCard: React.FC<{
  profile: DetailedAudienceProfile;
  onChange: (p: DetailedAudienceProfile) => void;
  onRemove: () => void;
}> = ({ profile, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#d4d4d4] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E8541A]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Users size={15} className="text-[#E8541A]" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <EditableField value={profile.name} onSave={(v) => onChange({ ...profile, name: v })}
              className="text-sm font-bold text-[#111111]" placeholder="Profile name" />
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setExpanded(!expanded)}
                className="w-6 h-6 rounded-lg hover:bg-[#fafafa] flex items-center justify-center text-[#717171] transition-colors">
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button onClick={onRemove}
                className="w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {/* Quick stats row */}
          <div className="flex flex-wrap gap-1.5">
            {profile.age && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-0.5 rounded-full">
                <Users size={9} /> {profile.age}
              </span>
            )}
            {profile.gender && (
              <span className="text-[10px] font-bold text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-0.5 rounded-full truncate max-w-[140px]">
                {profile.gender}
              </span>
            )}
            {profile.income && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-0.5 rounded-full">
                <DollarSign size={9} /> {profile.income}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#717171] bg-[#fafafa] border border-[#d4d4d4] px-2 py-0.5 rounded-full">
                <MapPin size={9} /> {profile.location}
              </span>
            )}
          </div>
          {profile.summary && (
            <EditableField value={profile.summary} onSave={(v) => onChange({ ...profile, summary: v })}
              className="text-[11px] text-[#717171] leading-relaxed" placeholder="Summary..." multiline />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#d4d4d4] bg-[#fafafa] p-4 space-y-4">

          {/* Pain Points */}
          {profile.painPoints?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171] flex items-center gap-1.5">
                <AlertCircle size={11} className="text-red-400" /> Pain Points
              </p>
              <ul className="space-y-1">
                {profile.painPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <EditableField value={p} onSave={(v) => onChange({
                      ...profile,
                      painPoints: profile.painPoints.map((x, idx) => idx === i ? v : x)
                    })} className="text-xs text-[#111111] flex-1" placeholder="Pain point..." />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {profile.goals?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171] flex items-center gap-1.5">
                <Target size={11} className="text-green-500" /> Goals
              </p>
              <ul className="space-y-1">
                {profile.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <EditableField value={g} onSave={(v) => onChange({
                      ...profile,
                      goals: profile.goals.map((x, idx) => idx === i ? v : x)
                    })} className="text-xs text-[#111111] flex-1" placeholder="Goal..." />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shopping behavior + channels */}
          <div className="grid grid-cols-2 gap-4">
            {profile.shoppingBehavior && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171] flex items-center gap-1.5">
                  <ShoppingCart size={11} /> Shopping Behavior
                </p>
                <EditableField value={profile.shoppingBehavior}
                  onSave={(v) => onChange({ ...profile, shoppingBehavior: v })}
                  className="text-xs text-[#111111]" placeholder="How they shop..." multiline />
              </div>
            )}
            {profile.channels?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171] flex items-center gap-1.5">
                  <Hash size={11} /> Channels
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.channels.map((ch, i) => (
                    <span key={i} className="text-[10px] font-bold text-[#E8541A] bg-[#E8541A]/10 px-2 py-0.5 rounded-full">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messaging Hook */}
          {profile.messagingHook && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171] flex items-center gap-1.5">
                <MessageSquare size={11} className="text-[#E8541A]" /> Messaging Hook
              </p>
              <div className="bg-[#E8541A]/5 border border-[#E8541A]/20 rounded-lg p-3">
                <EditableField value={profile.messagingHook}
                  onSave={(v) => onChange({ ...profile, messagingHook: v })}
                  className="text-xs font-medium text-[#111111] italic leading-relaxed" placeholder="Core message angle..."
                  multiline />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Brand Intelligence Widget ─────────────────────────────────────────────────
const BrandIntelligenceWidget: React.FC<{
  profiles: DetailedAudienceProfile[];
  onChange: (p: DetailedAudienceProfile[]) => void;
}> = ({ profiles, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', age: '', gender: '', income: '', location: '', summary: '' });

  const addProfile = () => {
    if (!draft.name) return;
    onChange([...profiles, {
      id: `aud-${Date.now()}`,
      painPoints: [], goals: [], shoppingBehavior: '', channels: [], messagingHook: '',
      ...draft,
    }]);
    setDraft({ name: '', age: '', gender: '', income: '', location: '', summary: '' });
    setAdding(false);
  };

  return (
    <div className="bg-white border border-[#d4d4d4] rounded-2xl">
      <div className="px-6 py-4 border-b border-[#d4d4d4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E8541A]/10 rounded-lg flex items-center justify-center">
            <Lightbulb size={15} className="text-[#E8541A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Strategy</p>
            <h3 className="text-sm font-bold text-[#111111]">Brand Intelligence</h3>
          </div>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#E8541A]/10 text-[#E8541A] px-3 py-1.5 rounded-lg hover:bg-[#E8541A] hover:text-white transition-all">
          <Plus size={11} /> Add Profile
        </button>
      </div>
      <div className="p-4 space-y-3">
        {adding && (
          <div className="p-4 rounded-xl border-2 border-[#E8541A]/30 bg-[#FFF3EE]/50 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8541A]">New Audience Profile</p>
            <div className="grid grid-cols-2 gap-2">
              <input autoFocus placeholder="Name (e.g. Core Buyer)" value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
              <input placeholder="Age range (e.g. 28-42)" value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                className="bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
              <input placeholder="Gender split" value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                className="bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
              <input placeholder="Income range" value={draft.income}
                onChange={(e) => setDraft({ ...draft, income: e.target.value })}
                className="bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
              <input placeholder="Location" value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className="col-span-2 bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
            </div>
            <textarea placeholder="Summary..." value={draft.summary} rows={2}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className="w-full bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A] resize-none" />
            <div className="flex gap-2">
              <button onClick={addProfile} className="flex-1 bg-[#E8541A] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#F97440] transition-colors">Add Profile</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 border border-[#d4d4d4] rounded-lg text-xs font-bold text-[#717171] hover:bg-[#fafafa] transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {profiles.length === 0 && !adding ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 bg-[#fafafa] border border-[#d4d4d4] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target size={18} className="text-[#717171]" />
            </div>
            <p className="text-sm font-bold text-[#111111]">No audience profiles yet</p>
            <p className="text-xs text-[#717171] mt-1">Connect your store or add manually</p>
          </div>
        ) : (
          profiles.map((p) => (
            <AudienceCard key={p.id} profile={p}
              onChange={(updated) => onChange(profiles.map((x) => x.id === p.id ? updated : x))}
              onRemove={() => onChange(profiles.filter((x) => x.id !== p.id))} />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Assets Widget ─────────────────────────────────────────────────────────────
const AssetsWidget: React.FC<{ assets: Asset[]; onChange: (a: Asset[]) => void }> = ({ assets, onChange }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAssets: Asset[] = files.map((f) => ({
      id: `asset-${Date.now()}-${Math.random()}`,
      name: f.name,
      url: URL.createObjectURL(f),
      type: 'Product Image',
    }));
    onChange([...assets, ...newAssets]);
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-[#d4d4d4] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E8541A]/10 rounded-lg flex items-center justify-center">
            <Image size={15} className="text-[#E8541A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Media</p>
            <h3 className="text-sm font-bold text-[#111111]">Brand Assets</h3>
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#E8541A]/10 text-[#E8541A] px-3 py-1.5 rounded-lg hover:bg-[#E8541A] hover:text-white transition-all cursor-pointer">
          <Upload size={11} /> Upload
          <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileUpload} />
        </label>
      </div>
      <div className="p-4">
        {assets.length === 0 ? (
          <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-[#d4d4d4] rounded-xl cursor-pointer hover:border-[#E8541A]/40 hover:bg-[#fafafa] transition-all">
            <Upload size={24} className="text-[#d4d4d4] mb-2" />
            <p className="text-xs font-bold text-[#717171]">Upload product images</p>
            <p className="text-[10px] text-[#717171]/60 mt-0.5">PNG, JPG up to 10MB</p>
            <input type="file" multiple accept="image/*" className="sr-only" onChange={handleFileUpload} />
          </label>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-2">
              {assets.slice(0, 12).map((asset) => (
                <div key={asset.id} className="group relative aspect-square rounded-lg overflow-hidden border border-[#d4d4d4] bg-[#fafafa]">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button onClick={() => onChange(assets.filter((a) => a.id !== asset.id))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-[#717171]">
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Campaigns Widget ──────────────────────────────────────────────────────────
const CampaignsWidget: React.FC<{ campaigns: Campaign[]; onChange: (c: Campaign[]) => void }> = ({ campaigns, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', impressions: '0', clicks: '0', ctr: '0%' });

  const updateField = (id: string, field: keyof Campaign, value: string) =>
    onChange(campaigns.map((c) => c.id === id ? { ...c, [field]: value } : c));

  return (
    <div className="bg-white border border-[#d4d4d4] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#d4d4d4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E8541A]/10 rounded-lg flex items-center justify-center">
            <Crosshair size={15} className="text-[#E8541A]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#717171]">Ads</p>
            <h3 className="text-sm font-bold text-[#111111]">Campaigns</h3>
          </div>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#E8541A]/10 text-[#E8541A] px-3 py-1.5 rounded-lg hover:bg-[#E8541A] hover:text-white transition-all">
          <Plus size={11} /> New
        </button>
      </div>
      <div className="p-4 space-y-2">
        {adding && (
          <div className="p-4 rounded-xl border-2 border-[#E8541A]/30 bg-[#FFF3EE]/50 space-y-2 mb-3">
            <input autoFocus placeholder="Campaign name" value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full bg-white border border-[#d4d4d4] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#E8541A]" />
            <div className="grid grid-cols-3 gap-2">
              {(['impressions', 'clicks', 'ctr'] as const).map((f) => (
                <div key={f}>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#717171] block mb-0.5">{f}</label>
                  <input value={draft[f]} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })}
                    className="w-full bg-white border border-[#d4d4d4] rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-[#E8541A]" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                if (!draft.name) return;
                onChange([...campaigns, { id: `camp-${Date.now()}`, status: 'active', ...draft }]);
                setDraft({ name: '', impressions: '0', clicks: '0', ctr: '0%' });
                setAdding(false);
              }} className="flex-1 bg-[#E8541A] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#F97440] transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1.5 border border-[#d4d4d4] rounded-lg text-xs font-bold text-[#717171]">Cancel</button>
            </div>
          </div>
        )}

        {campaigns.length === 0 && !adding ? (
          <div className="py-8 text-center">
            <TrendingUp size={18} className="text-[#717171] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#111111]">No campaigns yet</p>
            <p className="text-xs text-[#717171] mt-1">Create one to track performance</p>
          </div>
        ) : (
          <>
            {campaigns.length > 0 && (
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#717171] pb-1 px-1">
                <span>Campaign</span>
                <span className="w-12 text-right">Impr.</span>
                <span className="w-10 text-right">Clicks</span>
                <span className="w-8 text-right">CTR</span>
                <span className="w-5" />
              </div>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="group grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center py-2.5 border-t border-[#d4d4d4]/50 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => updateField(c.id, 'status', c.status === 'active' ? 'paused' : 'active')}
                    className={`w-2 h-2 rounded-full shrink-0 transition-colors ${c.status === 'active' ? 'bg-green-500' : 'bg-[#d4d4d4]'}`} />
                  <EditableField value={c.name} onSave={(v) => updateField(c.id, 'name', v)}
                    className="text-xs font-bold text-[#111111] truncate" placeholder="Campaign name" />
                </div>
                <EditableField value={c.impressions} onSave={(v) => updateField(c.id, 'impressions', v)} className="text-xs font-bold text-[#717171] text-right w-12" />
                <EditableField value={c.clicks} onSave={(v) => updateField(c.id, 'clicks', v)} className="text-xs font-bold text-[#717171] text-right w-10" />
                <EditableField value={c.ctr} onSave={(v) => updateField(c.id, 'ctr', v)} className="text-xs font-bold text-[#E8541A] text-right w-8" />
                <button onClick={() => onChange(campaigns.filter((x) => x.id !== c.id))}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center text-red-400 transition-all">
                  <X size={11} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [store, setStore] = useState<StoreConnection>(() => load('dashboard_store', { url: '', connected: false, storeName: '', lastSync: null }));
  const [brand, setBrand] = useState<BrandData>(() => load('dashboard_brand', DEFAULT_BRAND));
  const [audiences, setAudiences] = useState<DetailedAudienceProfile[]>(() => load('dashboard_audiences', []));
  const [assets, setAssets] = useState<Asset[]>(() => load('dashboard_assets', []));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => load('dashboard_campaigns', []));

  useEffect(() => { save('dashboard_store', store); }, [store]);
  useEffect(() => { save('dashboard_brand', brand); }, [brand]);
  useEffect(() => { save('dashboard_audiences', audiences); }, [audiences]);
  useEffect(() => { save('dashboard_assets', assets); }, [assets]);
  useEffect(() => { save('dashboard_campaigns', campaigns); }, [campaigns]);

  const handleExtracted = useCallback((result: Awaited<ReturnType<typeof extractBrandFromUrl>>) => {
    if (result.brand) {
      setBrand((prev) => ({ ...prev, ...result.brand }));
    }
    if (result.assets?.length) {
      setAssets((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        return [...prev, ...result.assets.filter((a) => !existingIds.has(a.id))];
      });
    }
    if (result.audiences?.length) {
      setAudiences((prev) => {
        // Drop any old auto-generated profiles (fallback/gemini) and old-format profiles (no painPoints field)
        const manualProfiles = prev.filter(
          (a) => !a.id.startsWith('aud-fallback-') && !a.id.startsWith('aud-gemini-') && !a.id.startsWith('aud-1-') && Array.isArray(a.painPoints)
        );
        const existingIds = new Set(manualProfiles.map((a) => a.id));
        return [...manualProfiles, ...result.audiences.filter((a) => !existingIds.has(a.id))];
      });
    }
  }, []);

  const stats = [
    { label: 'Assets', value: String(assets.length), icon: Image, color: '#E8541A', bg: '#FFF3EE' },
    { label: 'Templates', value: '9', icon: LayoutTemplate, color: '#111111', bg: '#f5f5f5' },
    { label: 'Generations', value: '16', icon: Sparkles, color: '#E8541A', bg: '#FFF3EE' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#717171] mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-[#111111]" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
        </div>
        <button className="flex items-center gap-2 bg-[#E8541A] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F97440] transition-all shadow-lg shadow-orange-500/20">
          <Sparkles size={15} /><span>New Generation</span>
        </button>
      </div>

      <StoreConnectWidget store={store} onConnect={setStore} onExtracted={handleExtracted} />

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#d4d4d4] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg }}>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <BrandSetupWidget data={brand} onChange={setBrand} />
        <BrandIntelligenceWidget profiles={audiences} onChange={setAudiences} />
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <AssetsWidget assets={assets} onChange={setAssets} />
        <CampaignsWidget campaigns={campaigns} onChange={setCampaigns} />
      </div>
    </div>
  );
};

export default Dashboard;
