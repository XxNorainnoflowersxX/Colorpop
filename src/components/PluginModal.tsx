import React, { useState, useRef } from 'react';
import {
  X,
  Puzzle,
  Heart,
  Briefcase,
  CloudMoon,
  Dices,
  Sparkles,
  Check,
  Plus,
  Upload,
  Download,
  Flame,
  FileCode,
  Sliders,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Plugin } from '../types/roleplay';

interface PluginModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugins: Plugin[];
  onTogglePlugin: (pluginId: string) => void;
  onSavePlugin: (plugin: Plugin) => void;
}

const PRESET_PLUGIN_TEMPLATES: Array<Omit<Plugin, 'id'>> = [
  {
    name: 'Sensory Touch & Breath Enhancer',
    icon: 'Sparkles',
    description: 'Instructs the AI to focus on subtle physical sensations, proximity, shallow breathing, skin temperature, and lingering touches.',
    category: 'immersion',
    enabled: true,
    config: { focus: 'sensory' },
    customPrompt: `Emphasize micro-sensations in every reply: describe the warmth of breath against skin, pulse rates, subtle shivering, involuntary glances, scent of perfume/cologne, and the weight of physical proximity.`,
    badge: 'Sensory Immersion Active',
  },
  {
    name: 'High-Tension Romantic Banter',
    icon: 'Heart',
    description: 'Sharpens character dialogue with electrifying wit, unspoken longing, teasing defiance, and undeniable romantic tension.',
    category: 'style',
    enabled: true,
    config: { tone: 'sassy' },
    customPrompt: `Keep character dialogue razor-sharp and emotionally magnetic. Infuse responses with flirtatious banter, double entendres, intense eye contact, and reluctance to admit vulnerability.`,
    badge: 'Tension Tuned High',
  },
  {
    name: 'Plot Twist & Unexpected Rivalry',
    icon: 'Dices',
    description: 'Introduces thrilling twists, suspicious footsteps, urgent phone calls, or surprise rivals during climactic moments.',
    category: 'mechanics',
    enabled: true,
    config: { frequency: 'medium' },
    customPrompt: `When the narrative reaches high emotional peaks or quiet moments, weave in subtle background intrigue: a distant car door slamming, a confidential text message notification, or sudden shifts in social dynamics.`,
    badge: 'Catalyst Ready',
  },
  {
    name: 'Atmospheric Scent & Soundscape',
    icon: 'CloudMoon',
    description: 'Rich sensory grounding with ambient soundscapes (rain against glass, distant bass, clinking crystal) and luxury scents.',
    category: 'immersion',
    enabled: true,
    config: { sensory: 'all' },
    customPrompt: `Ground every setting with acoustic and olfactory atmosphere: amber woodsmoke, rain tapping high-rise glass, muffled nightlife bass, and crisp midnight air.`,
    badge: 'Soundscape Active',
  },
];

export const PluginModal: React.FC<PluginModalProps> = ({
  isOpen,
  onClose,
  plugins,
  onTogglePlugin,
  onSavePlugin,
}) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'create' | 'presets'>('installed');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [icon, setIcon] = useState('Puzzle');
  const [category, setCategory] = useState<'mechanics' | 'immersion' | 'utility' | 'style'>('immersion');
  const [notification, setNotification] = useState<string | null>(null);
  const [showDirectivesPreview, setShowDirectivesPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlugin: Plugin = {
      id: `plugin_${Date.now()}`,
      name: name.trim(),
      icon,
      description: description.trim() || 'Custom user roleplay plugin',
      category,
      enabled: true,
      config: {},
      customPrompt: customPrompt.trim(),
      badge: 'Custom Plugin Active',
    };

    onSavePlugin(newPlugin);
    showToast(`✓ Created and activated plugin "${newPlugin.name}"!`);
    setActiveTab('installed');
    setName('');
    setDescription('');
    setCustomPrompt('');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        const importedList = Array.isArray(parsed) ? parsed : [parsed];
        let importedCount = 0;

        importedList.forEach((item: any) => {
          if (item && (item.name || item.title)) {
            const p: Plugin = {
              id: item.id || `plugin_imported_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              name: item.name || item.title || 'Imported Plugin',
              icon: item.icon || 'Puzzle',
              description: item.description || item.summary || 'Imported plugin directives',
              category: item.category || 'immersion',
              enabled: true,
              config: item.config || {},
              customPrompt: item.customPrompt || item.prompt || item.systemPrompt || item.content || '',
              badge: item.badge || 'Imported Plugin',
            };
            onSavePlugin(p);
            importedCount++;
          }
        });

        showToast(`✓ Successfully imported ${importedCount} plugin(s)! Now active in roleplay.`);
        setActiveTab('installed');
      } catch (err: any) {
        showToast(`Failed to parse plugin JSON: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyPreset = (preset: Omit<Plugin, 'id'>) => {
    const newP: Plugin = {
      ...preset,
      id: `plugin_preset_${Date.now()}`,
    };
    onSavePlugin(newP);
    showToast(`✓ Installed preset "${preset.name}" into your active plugins!`);
    setActiveTab('installed');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400 fill-rose-500/30" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'CloudMoon':
        return <CloudMoon className="w-5 h-5 text-sky-400" />;
      case 'Dices':
        return <Dices className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
      default:
        return <Puzzle className="w-5 h-5 text-indigo-400" />;
    }
  };

  const activePlugins = plugins.filter((p) => p.enabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#140410] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_50px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Toast */}
        {notification && (
          <div className="absolute top-16 right-6 z-50 px-4 py-2 bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0d020b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00b4db] to-[#0083b0] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,180,219,0.5)]">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Plugin Studio &amp; Library</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff3399]/40 text-[#ff99cc]">
                  {activePlugins.length} Active in Roleplay
                </span>
              </div>
              <p className="text-xs text-[#ffd6eb]/70">
                Plugins inject verified game mechanics, styles, and sensory directives into OpenRouter
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center space-x-1.5 transition-all"
              title="Import plugin JSON from file"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Import Plugin</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-[#ffd6eb]/70 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#1b0517] border-b border-[#ff3399]/20 text-xs font-bold">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-3 py-1 rounded-xl transition-all ${
                activeTab === 'installed'
                  ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                  : 'text-[#ffd6eb]/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Installed ({plugins.length})
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-xl transition-all flex items-center space-x-1 ${
                activeTab === 'presets'
                  ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                  : 'text-[#ffd6eb]/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Presets &amp; Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1 rounded-xl transition-all flex items-center space-x-1 ${
                activeTab === 'create'
                  ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                  : 'text-[#ffd6eb]/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
          </div>

          <button
            onClick={() => setShowDirectivesPreview(!showDirectivesPreview)}
            className="text-[11px] text-[#ff99cc] hover:text-white flex items-center space-x-1"
          >
            <Info className="w-3 h-3" />
            <span>{showDirectivesPreview ? 'Hide Prompt Injection' : 'Inspect Prompt Injection'}</span>
          </button>
        </div>

        {/* Directives Preview Box */}
        {showDirectivesPreview && (
          <div className="p-4 bg-black/60 border-b border-[#ff3399]/30 text-xs font-mono text-cyan-200 space-y-1">
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-bold">
              Live Prompt Injected into OpenRouter for this chat:
            </div>
            <div className="p-3 bg-[#11020f] border border-cyan-500/30 rounded-xl whitespace-pre-wrap max-h-36 overflow-y-auto">
              {activePlugins.length === 0 ? (
                <span className="text-white/40 italic">No plugins currently active. Enable plugins below to inject directives.</span>
              ) : (
                activePlugins.map((p, idx) => (
                  <div key={p.id} className="mb-2">
                    <span className="text-[#ff80bf] font-bold">[{idx + 1}] {p.name}:</span> {p.description}
                    {p.customPrompt && <div className="text-white/80 pl-4 mt-0.5">Directives: {p.customPrompt}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-[#ffd6eb]">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-white">Plugin Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Heartbeat Tension Sensor, Scent & Weather Generator..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff007f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3.5 py-2 text-xs text-white"
                  >
                    <option value="immersion">Immersion (Sensory, Weather, Mood)</option>
                    <option value="style">Style (Romance, Prose, Banter)</option>
                    <option value="mechanics">Mechanics (Dice, Items, Twists)</option>
                    <option value="utility">Utility (Recap, Notes, Inventory)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Icon Symbol</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3.5 py-2 text-xs text-white"
                  >
                    <option value="Sparkles">Sparkles ✨</option>
                    <option value="Heart">Heart ❤️</option>
                    <option value="Dices">Dice 🎲</option>
                    <option value="CloudMoon">Cloud / Moon 🌙</option>
                    <option value="Briefcase">Briefcase 💼</option>
                    <option value="Puzzle">Puzzle 🧩</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Description</label>
                <input
                  type="text"
                  placeholder="Summary of how this plugin impacts character behavior..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff007f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Custom System Prompt Injection *</label>
                <p className="text-[11px] text-[#ffd6eb]/70">
                  These instructions are passed directly to the OpenRouter AI model on every interaction.
                </p>
                <textarea
                  rows={4}
                  placeholder="Detailed guidelines injected into OpenRouter system instructions (e.g. Focus on heart rates, dialogue pacing, secret glances...)"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl p-3 text-xs text-white resize-none font-mono focus:outline-none focus:border-[#ff007f]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#ff3399]/20">
                <button
                  type="button"
                  onClick={() => setActiveTab('installed')}
                  className="px-4 py-2 bg-white/10 rounded-xl text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#ff007f] to-[#ff3399] rounded-xl text-white font-bold shadow-[0_0_15px_rgba(255,0,128,0.7)] hover:scale-105 transition-all"
                >
                  Create &amp; Activate Plugin
                </button>
              </div>
            </form>
          ) : activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#ffd6eb]/80 pb-2 border-b border-white/10">
                <span>Select a ready-to-use roleplay enhancement to instantly install:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_PLUGIN_TEMPLATES.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#1b0517] border border-[#ff3399]/30 hover:border-[#ff007f] shadow-lg flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                            {getIcon(preset.icon)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{preset.name}</h4>
                            <span className="text-[10px] font-mono uppercase text-[#ff99cc]">
                              {preset.category}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#ffd6eb]">
                          Verified Preset
                        </span>
                      </div>

                      <p className="text-xs text-[#ffd6eb]/80 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-[#ffd6eb]/70 line-clamp-3">
                        {preset.customPrompt}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full py-2 bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold rounded-xl text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Install &amp; Activate</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-[#ffd6eb]/70 pb-1">
                <span>Active Plugins ({activePlugins.length} / 5 Slots Active)</span>
                <span>Active plugins will be dynamically injected on your next chat message</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      plugin.enabled
                        ? 'bg-[#ff007f]/15 border-[#ff007f] shadow-[0_0_15px_rgba(255,0,128,0.3)]'
                        : 'bg-[#1a0515] border-[#ff3399]/20 opacity-70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center">
                            {getIcon(plugin.icon)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{plugin.name}</h4>
                            <span className="text-[10px] font-mono uppercase text-[#ff99cc]">
                              {plugin.category}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onTogglePlugin(plugin.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                            plugin.enabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                              : 'bg-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {plugin.enabled ? '✓ Active' : 'Disabled'}
                        </button>
                      </div>

                      <p className="text-xs text-[#ffd6eb]/80 leading-relaxed">
                        {plugin.description}
                      </p>

                      {plugin.customPrompt && (
                        <div className="p-2 rounded-lg bg-black/30 border border-white/10 text-[10px] font-mono text-[#ffd6eb]/60 line-clamp-2">
                          Directives: {plugin.customPrompt}
                        </div>
                      )}
                    </div>

                    {plugin.badge && (
                      <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-[#ffd6eb]/60">Status:</span>
                        <span className="font-mono text-[#ff80bf] font-bold">{plugin.badge}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
