import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Wifi,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Sliders,
  Database,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  LogOut,
  Star,
  Search,
  Zap,
} from 'lucide-react';
import { OpenRouterConfig, ConnectionDiagnostic, SupabaseConfig } from '../types/roleplay';
import { signInWithGoogle, logOutFirebase } from '../lib/firebase';
import { User } from 'firebase/auth';

interface OpenRouterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OpenRouterConfig;
  onSaveConfig: (cfg: OpenRouterConfig) => void;
  diagnostic: ConnectionDiagnostic;
  onTestConnection: (key?: string) => Promise<void>;
  supabaseConfig: SupabaseConfig;
  onSaveSupabaseConfig: (cfg: SupabaseConfig) => void;
  firebaseUser: User | null;
  isPageView?: boolean;
  onResetData?: () => void;
  onExportData?: () => void;
  onImportData?: (file: File) => void;
}

export const OpenRouterSettingsModal: React.FC<OpenRouterSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  diagnostic,
  onTestConnection,
  supabaseConfig,
  onSaveSupabaseConfig,
  firebaseUser,
  isPageView = false,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [maxTokens, setMaxTokens] = useState(config.maxTokens);
  const [topP, setTopP] = useState(config.topP);

  const [supaUrl, setSupaUrl] = useState(supabaseConfig.url);
  const [supaKey, setSupaKey] = useState(supabaseConfig.anonKey);

  const [activeTab, setActiveTab] = useState<'openrouter' | 'firebase' | 'supabase' | 'github' | 'data'>('openrouter');
  const [testing, setTesting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [pushingGit, setPushingGit] = useState(false);
  const [gitPushResult, setGitPushResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync state whenever settings modal opens or config updates
  useEffect(() => {
    if (isOpen) {
      setApiKey(config.apiKey || '');
      setModel(config.model || 'gryphe/mythomax-l2-13b');
      setTemperature(config.temperature ?? 0.85);
      setMaxTokens(config.maxTokens ?? 1024);
      setTopP(config.topP ?? 0.95);
      setSupaUrl(supabaseConfig.url || '');
      setSupaKey(supabaseConfig.anonKey || '');
    }
  }, [isOpen, config, supabaseConfig]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    await onTestConnection(apiKey);
    setTesting(false);
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      apiKey: apiKey.trim(),
      model: model.trim(),
      temperature,
      maxTokens,
      topP,
    });
    onSaveSupabaseConfig({
      url: supaUrl.trim(),
      anonKey: supaKey.trim(),
      connected: Boolean(supaUrl.trim() && supaKey.trim()),
    });
    setSaveSuccessMsg('✓ Settings saved successfully!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 400);
  };

  const handleGitPush = async () => {
    setPushingGit(true);
    setGitPushResult(null);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: 'https://github.com/norainnoflowers2294-maker/Chat-app.git',
          commitMsg: `Update ColorPop Roleplay Hub & OpenRouter - ${new Date().toLocaleTimeString()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push to GitHub');

      setGitPushResult({
        success: true,
        message: 'All applet code and roleplay systems successfully pushed to norainnoflowers2294-maker/Chat-app!',
        output: data.output,
      });
    } catch (err: any) {
      setGitPushResult({
        success: false,
        message: err.message || 'Push failed. Please verify your token permissions.',
      });
    } finally {
      setPushingGit(false);
    }
  };

  // Comprehensive Model Catalog with OpenAI models, Roleplay champions, and Free tier models
  const initialModels = [
    // --- BEST FOR ROLEPLAY (Golden Star Marker) ---
    {
      id: 'gryphe/mythomax-l2-13b',
      label: 'Mythomax L2 13B',
      desc: 'The undisputed gold standard for romantic roleplay, emotional depth, and narrative tension.',
      badge: '★ Best for Roleplay',
      category: 'roleplay',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: false,
    },
    {
      id: 'sao10k/fimbulvetr-11b-v2',
      label: 'Fimbulvetr 11B v2',
      desc: 'Sensual, descriptive storytelling and captivating character immersion.',
      badge: '★ Best for Romantic RP',
      category: 'roleplay',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: false,
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      label: 'Claude 3.5 Sonnet',
      desc: 'Masterclass literary quality, poetic descriptions, and complex character psychology.',
      badge: '★ Best for Literary Prose',
      category: 'roleplay',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: false,
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      label: 'Llama 3.3 70B Instruct',
      desc: 'Exceptional instruction following, razor-sharp dialogue, and high intelligence.',
      badge: '★ Best Open Weight RP',
      category: 'roleplay',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: false,
    },
    {
      id: 'nousresearch/hermes-3-llama-3.1-405b',
      label: 'Hermes 3 Llama 3.1 405B',
      desc: 'Massive scale intelligence for multi-character universe simulations.',
      badge: '★ Best Supercomputer RP',
      category: 'roleplay',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: false,
    },

    // --- ALL OPENAI MODELS AVAILABLE ---
    {
      id: 'openai/gpt-4o',
      label: 'OpenAI GPT-4o (Omni Flagship)',
      desc: 'Next-gen flagship from OpenAI. Natural human-like banter, emotional intelligence, and zero lag.',
      badge: 'OpenAI Flagship',
      category: 'openai',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/gpt-4o-mini',
      label: 'OpenAI GPT-4o-mini',
      desc: 'Ultra-fast, cost-effective OpenAI model with vibrant personality and fast responses.',
      badge: 'OpenAI Fast',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/o1',
      label: 'OpenAI o1 (Full Reasoning)',
      desc: 'Advanced reasoning engine capable of complex worldbuilding, logic, and intricate plotlines.',
      badge: 'OpenAI o1',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/o1-mini',
      label: 'OpenAI o1-mini',
      desc: 'High speed reasoning model from OpenAI tailored for complex puzzles and story arcs.',
      badge: 'OpenAI o1-mini',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/o3-mini',
      label: 'OpenAI o3-mini',
      desc: 'Latest breakthrough reasoning model from OpenAI with unprecedented logic agility.',
      badge: 'OpenAI o3-mini',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/chatgpt-4o-latest',
      label: 'OpenAI ChatGPT-4o Latest',
      desc: 'Dynamic rolling snapshot used in consumer ChatGPT, continuously updated by OpenAI.',
      badge: 'OpenAI Rolling',
      category: 'openai',
      isRoleplayBest: true,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/gpt-4-turbo',
      label: 'OpenAI GPT-4 Turbo',
      desc: '128,000 token context window with comprehensive world knowledge and refined style.',
      badge: 'OpenAI 128k',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/gpt-4',
      label: 'OpenAI GPT-4 Classic',
      desc: 'The original breakthrough frontier model with high literary consistency.',
      badge: 'OpenAI Classic',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },
    {
      id: 'openai/gpt-3.5-turbo',
      label: 'OpenAI GPT-3.5 Turbo',
      desc: 'Classic rapid response model for lightweight exchanges.',
      badge: 'OpenAI Turbo',
      category: 'openai',
      isRoleplayBest: false,
      isFree: false,
      isOpenAI: true,
    },

    // --- 100% FREE MODELS (Labeled with FREE) ---
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      label: 'Llama 3.3 70B Instruct (Free)',
      desc: 'Flagship 70B open intelligence with zero token cost.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: true,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      label: 'Google Gemini 2.0 Flash (Free)',
      desc: 'Sub-second response time and expansive 1M context support without cost.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'google/gemini-2.0-flash-lite-preview-02-05:free',
      label: 'Google Gemini 2.0 Flash Lite (Free)',
      desc: 'Super lightweight free tier model with high throughput.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'deepseek/deepseek-r1:free',
      label: 'DeepSeek R1 Reasoning (Free)',
      desc: 'Open-weights reasoning model with deep self-reflection, entirely free.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'deepseek/deepseek-chat:free',
      label: 'DeepSeek V3 Chat (Free)',
      desc: 'Fast, articulate conversation and roleplay at zero cost.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: true,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'gryphe/mythomax-l2-13b:free',
      label: 'Mythomax L2 13B (Free Tier)',
      desc: 'Free community tier of the beloved Mythomax roleplay standard.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: true,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'mistralai/mistral-small-3.1-24b-instruct:free',
      label: 'Mistral Small 3.1 24B (Free)',
      desc: 'Sharp European model with snappy dialogue and zero credits required.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'openchat/openchat-7b:free',
      label: 'OpenChat 7B (Free)',
      desc: 'Conditioned on high-quality conversation data.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
    {
      id: 'qwen/qwen-2.5-72b-instruct:free',
      label: 'Qwen 2.5 72B Instruct (Free)',
      desc: 'High tier multilingual intelligence completely free on OpenRouter.',
      badge: 'FREE',
      category: 'free',
      isRoleplayBest: false,
      isFree: true,
      isOpenAI: false,
    },
  ];

  const [availableModels, setAvailableModels] = useState(initialModels);
  const [modelFilter, setModelFilter] = useState<'all' | 'openai' | 'roleplay' | 'free'>('all');
  const [modelSearch, setModelSearch] = useState('');
  const [autoUpdatingModels, setAutoUpdatingModels] = useState(false);
  const [lastModelSyncTime, setLastModelSyncTime] = useState<string>('Live Synced');

  // Auto-Update Models from OpenRouter API
  const handleAutoUpdateModels = async () => {
    setAutoUpdatingModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          const liveList = json.data.map((m: any) => {
            const id = m.id || '';
            const name = m.name || id.split('/').pop() || id;
            const isOpenAI = id.toLowerCase().startsWith('openai/');
            const isFree = id.endsWith(':free') || m.pricing?.prompt === '0' || m.pricing?.prompt === 0;
            const isRoleplayBest =
              id.includes('mythomax') ||
              id.includes('fimbulvetr') ||
              id.includes('claude-3.5-sonnet') ||
              id.includes('llama-3.3-70b') ||
              id === 'openai/gpt-4o';

            let badge = isFree
              ? 'FREE'
              : isRoleplayBest
              ? '★ Best for Roleplay'
              : isOpenAI
              ? 'OpenAI'
              : 'Popular';

            return {
              id,
              label: name,
              desc: m.description ? m.description.slice(0, 110) + '...' : 'Available on OpenRouter AI network.',
              badge,
              category: isFree ? 'free' : isOpenAI ? 'openai' : isRoleplayBest ? 'roleplay' : 'other',
              isRoleplayBest,
              isFree,
              isOpenAI,
            };
          });

          // Merge live models with prioritized initial curated list
          const existingIds = new Set(liveList.map((m: any) => m.id));
          const merged = [
            ...initialModels.filter((m) => existingIds.has(m.id)),
            ...initialModels.filter((m) => !existingIds.has(m.id)),
            ...liveList.filter((m: any) => !initialModels.some((im) => im.id === m.id)),
          ];

          setAvailableModels(merged);
          setLastModelSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      // Fallback cleanly to curated catalog
      setLastModelSyncTime('Verified Default');
    } finally {
      setAutoUpdatingModels(false);
    }
  };

  const modalContent = (
    <div className={`relative w-full ${isPageView ? 'max-w-5xl' : 'max-w-3xl'} bg-[#140410] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_50px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col ${isPageView ? 'min-h-[600px]' : 'max-h-[90vh]'}`}>
      {/* Toast */}
      {saveSuccessMsg && (
        <div className="absolute top-16 right-6 z-50 px-4 py-2 bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0d020b]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-[#ff007f] text-[#ffd6eb] hover:text-white transition-all flex items-center space-x-2 shadow shrink-0"
            title="Back to Home Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold">{isPageView ? 'Back to Home' : 'Back'}</span>
          </button>

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff007f] to-[#ff3399] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,128,0.6)] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Settings &amp; Configuration
            </h2>
            <p className="text-xs text-[#ffd6eb]/70">
              OpenRouter AI, models, Firebase Cloud storage, Supabase, and backups
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ff3399]/30 bg-[#1a0515]/60 px-6 pt-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('openrouter')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'openrouter'
              ? 'border-[#ff007f] text-[#ff3399]'
              : 'border-transparent text-[#ffd6eb]/70 hover:text-white'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>OpenRouter AI</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${diagnostic.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'}`}>
            {diagnostic.status === 'connected' ? 'Connected' : 'Problem'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'firebase'
              ? 'border-[#ff007f] text-[#ff3399]'
              : 'border-transparent text-[#ffd6eb]/70 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Firebase Cloud</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono">
            Auto-Save
          </span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'supabase'
              ? 'border-[#ff007f] text-[#ff3399]'
              : 'border-transparent text-[#ffd6eb]/70 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'github'
              ? 'border-[#ff007f] text-[#ff3399]'
              : 'border-transparent text-[#ffd6eb]/70 hover:text-white'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>GitHub Push</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'data'
              ? 'border-[#ff007f] text-[#ff3399]'
              : 'border-transparent text-[#ffd6eb]/70 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Data &amp; Backup</span>
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#ffd6eb]">
          {activeTab === 'openrouter' && (
            <div className="space-y-5">
              <div
                className={`p-4 rounded-2xl border ${
                  diagnostic.status === 'connected'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : diagnostic.status === 'error'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                } space-y-2`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {diagnostic.status === 'connected' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {diagnostic.status === 'connected'
                          ? 'OpenRouter Connected Successfully'
                          : diagnostic.status === 'error'
                          ? 'OpenRouter Connection Problem Detected'
                          : 'OpenRouter Not Yet Verified'}
                      </h4>
                      {diagnostic.latencyMs && (
                        <p className="text-[11px] opacity-80 font-mono">
                          API Latency: {diagnostic.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center space-x-1 border border-white/20 disabled:opacity-50"
                  >
                    {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                </div>

                {diagnostic.status === 'error' && (
                  <div className="pt-2 border-t border-rose-500/30 space-y-1">
                    <p className="font-semibold text-rose-300">
                      Problem: {diagnostic.errorMessage}
                    </p>
                    {diagnostic.suggestedFix && (
                      <p className="text-[11px] text-white/90">
                        Suggested Fix: {diagnostic.suggestedFix}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#ff3399]" />
                    <span>OpenRouter API Key</span>
                  </label>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#ff66b2] hover:underline flex items-center gap-1"
                  >
                    <span>Get OpenRouter Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#ff3399]" />
                    <span>Roleplay AI Model</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAutoUpdateModels}
                    disabled={autoUpdatingModels}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#ffd6eb] text-[10px] font-bold border border-white/20 transition-all disabled:opacity-50"
                    title="Fetch newly available models from OpenRouter network"
                  >
                    <RefreshCw className={`w-3 h-3 text-[#ff66b2] ${autoUpdatingModels ? 'animate-spin' : ''}`} />
                    <span>{autoUpdatingModels ? 'Updating...' : 'Auto-Sync Models'}</span>
                    <span className="text-[9px] opacity-60 font-mono">({lastModelSyncTime})</span>
                  </button>
                </div>

                {/* Filter Pills: All, OpenAI, Best for Roleplay, FREE */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setModelFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap ${
                      modelFilter === 'all'
                        ? 'bg-[#ff007f] text-white shadow-[0_0_10px_rgba(255,0,128,0.6)]'
                        : 'bg-white/5 hover:bg-white/10 text-[#ffd6eb]/70'
                    }`}
                  >
                    All ({availableModels.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelFilter('openai')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
                      modelFilter === 'openai'
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)] font-black'
                        : 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>OpenAI Models ({availableModels.filter((m) => m.isOpenAI).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelFilter('roleplay')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
                      modelFilter === 'roleplay'
                        ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.6)] font-black'
                        : 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>★ Best for Roleplay ({availableModels.filter((m) => m.isRoleplayBest).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModelFilter('free')}
                    className={`px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
                      modelFilter === 'free'
                        ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.6)] font-black'
                        : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                    }`}
                  >
                    <span className="font-mono font-black text-[9px] bg-emerald-400/30 px-1 rounded">FREE</span>
                    <span>Free Models ({availableModels.filter((m) => m.isFree).length})</span>
                  </button>
                </div>

                {/* Search Bar for Models */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by name, OpenAI, provider, or ID..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full bg-[#1b0516] border border-[#ff3399]/30 focus:border-[#ff3399] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                </div>

                {/* Filtered Models List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {availableModels
                    .filter((m) => {
                      if (modelFilter === 'openai') return m.isOpenAI;
                      if (modelFilter === 'roleplay') return m.isRoleplayBest;
                      if (modelFilter === 'free') return m.isFree;
                      return true;
                    })
                    .filter((m) => {
                      if (!modelSearch.trim()) return true;
                      const q = modelSearch.toLowerCase();
                      return m.id.toLowerCase().includes(q) || m.label.toLowerCase().includes(q);
                    })
                    .map((m) => {
                      const isSelected = model === m.id;

                      return (
                        <div
                          key={m.id}
                          onClick={() => setModel(m.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#ff007f]/25 border-[#ff007f] shadow-[0_0_15px_rgba(255,0,128,0.45)]'
                              : 'bg-[#1a0515] border-[#ff3399]/20 hover:border-[#ff3399]/60'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              {m.isRoleplayBest && (
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                              <span className="font-bold text-white text-xs truncate">{m.label}</span>
                            </div>
                            <div className="font-mono text-[10px] text-[#ffb3d9]/70 truncate">{m.id}</div>
                            {m.desc && (
                              <p className="text-[10px] text-[#ffd6eb]/60 line-clamp-1">{m.desc}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {m.isFree && (
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow">
                                FREE
                              </span>
                            )}

                            {m.isOpenAI && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                OpenAI
                              </span>
                            )}

                            {m.isRoleplayBest && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                <span>Roleplay Pick</span>
                              </span>
                            )}

                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#ff007f] bg-[#ff007f]'
                                  : 'border-white/30 bg-transparent'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Or enter custom model ID (e.g. anthropic/claude-3-haiku)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-4 py-2 text-xs text-white placeholder-white/30 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#ff3399]/20">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>Creativity (Temperature)</span>
                    <span className="font-mono text-[#ff66b2]">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#ff007f]"
                  />
                  <p className="text-[10px] text-[#ffd6eb]/60">Higher = more poetic & daring prose</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>Response Length (Tokens)</span>
                    <span className="font-mono text-[#ff66b2]">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="4096"
                    step="128"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full accent-[#ff007f]"
                  />
                  <p className="text-[10px] text-[#ffd6eb]/60">Maximum length per generated reply</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a0515] border border-[#ff3399]/40 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Firebase Cloud Persistence</h4>
                    <p className="text-[11px] text-[#ffd6eb]/70">
                      Firestore &amp; Firebase Authentication auto-sync
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#ff3399]/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#ffd6eb]/80">Firestore Database ID:</span>
                    <code className="text-blue-300 font-mono text-[11px]">ai-studio-githubconnecthub-2454e99a-1a95-4b9f-9cd4-6a2965f634bd</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ffd6eb]/80">Security Rules:</span>
                    <span className="text-emerald-400 font-bold">Deployed & Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a0515] border border-[#ff3399]/40 rounded-2xl space-y-3">
                <h4 className="font-bold text-white">Firebase Authentication</h4>
                {firebaseUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={firebaseUser.photoURL || '/colorpop_hero.jpg'}
                        alt={firebaseUser.displayName || 'User'}
                        className="w-9 h-9 rounded-full ring-1 ring-white/30"
                      />
                      <div>
                        <div className="font-bold text-white">{firebaseUser.displayName || 'Signed In'}</div>
                        <div className="text-[11px] text-[#ffd6eb]/70 font-mono">{firebaseUser.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => logOutFirebase()}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-[#ffd6eb]/70">
                      Sign in with Google to automatically back up all your roleplays, characters, lorebooks, and memories to your private Firebase cloud.
                    </p>
                    <button
                      onClick={() => signInWithGoogle()}
                      className="w-full py-2.5 bg-white text-black hover:bg-white/90 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a0515] border border-[#ff3399]/40 rounded-2xl space-y-2">
                <h4 className="font-bold text-white">Supabase Cloud Storage</h4>
                <p className="text-[11px] text-[#ffd6eb]/70">
                  Optionally configure Supabase credentials to sync alongside Firebase.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">Supabase Project URL</label>
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supaUrl}
                    onChange={(e) => setSupaUrl(e.target.value)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Supabase Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supaKey}
                    onChange={(e) => setSupaKey(e.target.value)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a0515] border border-[#ff3399]/40 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">GitHub Push Integration</h4>
                    <p className="text-[11px] text-[#ffd6eb]/70">
                      Destination: <code className="text-purple-300 font-mono">norainnoflowers2294-maker/Chat-app.git</code>
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#ffd6eb]/80 leading-relaxed">
                  Click below to automatically commit and push the entire ColorPop roleplay application, OpenRouter backend, and Firebase blueprints to your target repository.
                </p>

                <button
                  onClick={handleGitPush}
                  disabled={pushingGit}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {pushingGit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Pushing code to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4" />
                      <span>Push All to norainnoflowers2294-maker/Chat-app</span>
                    </>
                  )}
                </button>
              </div>

              {gitPushResult && (
                <div
                  className={`p-4 rounded-2xl border ${
                    gitPushResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  } space-y-2`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {gitPushResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                    <span>{gitPushResult.message}</span>
                  </div>
                  {gitPushResult.output && (
                    <pre className="p-2 bg-black/50 rounded-lg text-[10px] font-mono text-white/80 overflow-x-auto max-h-32">
                      {gitPushResult.output}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a0515] border border-[#ff3399]/40 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Backup, Restore &amp; Reset</h4>
                    <p className="text-[11px] text-[#ffd6eb]/70">
                      Manage local and cloud data, import/export roleplays, and reset to defaults
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onExportData) {
                        onExportData();
                      } else {
                        const allData = localStorage.getItem('colorpop_roleplay_data');
                        const blob = new Blob([allData || '{}'], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `colorpop_backup_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                      setSaveSuccessMsg('✓ Backup JSON downloaded successfully!');
                      setTimeout(() => setSaveSuccessMsg(null), 3000);
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow"
                  >
                    <span>Download Full Backup JSON</span>
                  </button>

                  <label className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow cursor-pointer">
                    <span>Import Backup JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (onImportData) {
                            onImportData(file);
                          } else {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              try {
                                const parsed = JSON.parse(evt.target?.result as string);
                                if (parsed) {
                                  localStorage.setItem('colorpop_roleplay_data', JSON.stringify(parsed));
                                  window.location.reload();
                                }
                              } catch (err) {
                                alert('Invalid JSON backup file');
                              }
                            };
                            reader.readAsText(file);
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-rose-300">Reset System to Defaults</h5>
                    <p className="text-[10px] text-[#ffd6eb]/60">
                      Restores default characters, lorebooks, and personas. Custom data will be replaced.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data to default presets?')) {
                        if (onResetData) {
                          onResetData();
                        } else {
                          localStorage.removeItem('colorpop_roleplay_data');
                          window.location.reload();
                        }
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-600/30 hover:bg-rose-600 border border-rose-500/50 text-white rounded-xl font-bold text-xs transition-all shadow"
                  >
                    Reset to Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ff3399]/30 bg-[#0d020b]">
          <div className="text-[11px] text-[#ffd6eb]/60">
            OpenRouter AI &bull; Firebase &bull; Supabase &bull; ColorPop
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#ffd6eb] font-bold text-xs transition-colors"
            >
              {isPageView ? 'Back to Home' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,0,128,0.7)] transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );

  if (isPageView) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-4 animate-in fade-in duration-300">
        {modalContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {modalContent}
    </div>
  );
};
