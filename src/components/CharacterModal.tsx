import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Upload,
  Download,
  Plus,
  Users,
  Search,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { Character } from '../types/roleplay';
import { parseCharacterFile, exportCharacterJson } from '../utils/pngParser';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSaveCharacter: (char: Character) => void;
  onStartChatWithCharacter: (char: Character) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  characters,
  onSaveCharacter,
  onStartChatWithCharacter,
}) => {
  const [view, setView] = useState<'library' | 'create'>('library');
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('/lucious.jpg');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [scenario, setScenario] = useState('');
  const [firstMes, setFirstMes] = useState('');
  const [mesExample, setMesExample] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Romance', 'Billionaire']);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseCharacterFile(file);
      const charName = parsed.name?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newChar: Character = {
        id: `char_${Date.now()}`,
        name: charName,
        avatar: parsed.avatar || '/lucious.jpg',
        summary: parsed.summary?.trim() || parsed.description?.slice(0, 140) || 'Imported character into gallery',
        description: parsed.description?.trim() || '',
        personality: parsed.personality?.trim() || '',
        scenario: parsed.scenario?.trim() || '',
        first_mes: parsed.first_mes?.trim() || `*${charName} arrives, looking directly at you.* "Shall we begin?"`,
        mes_example: parsed.mes_example?.trim() || '',
        system_prompt: parsed.system_prompt?.trim() || '',
        tags: parsed.tags?.length ? parsed.tags : ['Imported', 'Romance'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Automatically save to the character gallery immediately
      onSaveCharacter(newChar);
      setNotification(`★ Imported and saved "${newChar.name}" to character gallery!`);
      setTimeout(() => setNotification(null), 4000);
      setView('library');
    } catch (err: any) {
      console.error('Failed to parse file:', err);
      setNotification(`Could not import file: ${err.message || 'Invalid format'}`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChar: Character = {
      id: isEditingId || `char_${Date.now()}`,
      name: name.trim(),
      avatar: avatar || '/lucious.jpg',
      summary: summary.trim() || description.slice(0, 140),
      description: description.trim(),
      personality: personality.trim(),
      scenario: scenario.trim(),
      first_mes: firstMes.trim() || `*${name.trim()} smiles warmly at you.* "It is wonderful to meet you."`,
      mes_example: mesExample.trim(),
      system_prompt: systemPrompt.trim(),
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCharacter(newChar);
    setNotification(`Saved "${newChar.name}" to character gallery!`);
    setTimeout(() => setNotification(null), 3500);
    resetForm();
    setView('library');
  };

  const startEdit = (char: Character) => {
    setIsEditingId(char.id);
    setName(char.name);
    setAvatar(char.avatar);
    setSummary(char.summary);
    setDescription(char.description);
    setPersonality(char.personality);
    setScenario(char.scenario);
    setFirstMes(char.first_mes);
    setMesExample(char.mes_example);
    setSystemPrompt(char.system_prompt || '');
    setTags(char.tags);
    setView('create');
  };

  const resetForm = () => {
    setIsEditingId(null);
    setName('');
    setAvatar('/lucious.jpg');
    setSummary('');
    setDescription('');
    setPersonality('');
    setScenario('');
    setFirstMes('');
    setMesExample('');
    setSystemPrompt('');
    setTags(['Romance']);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#140410] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_50px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0d020b]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff007f] to-[#ff3399] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,128,0.6)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Character Studio &amp; Library
              </h2>
              <p className="text-xs text-[#ffd6eb]/70">
                Import PNG or JSON cards, create bespoke characters, and start roleplays
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="cursor-pointer px-3 py-1.5 bg-[#ff007f]/20 hover:bg-[#ff007f]/40 border border-[#ff66b2]/50 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-[0_0_10px_rgba(255,0,128,0.3)]">
              <Upload className="w-3.5 h-3.5" />
              <span>Import PNG / JSON</span>
              <input
                type="file"
                accept=".png,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                if (view === 'create') {
                  setView('library');
                } else {
                  resetForm();
                  setView('create');
                }
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,128,0.5)] flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{view === 'create' ? 'View Library' : 'Create Character'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-6 mt-3 px-4 py-2 bg-gradient-to-r from-[#ff007f] to-[#9b51e0] text-white text-xs font-bold rounded-2xl shadow-[0_0_20px_rgba(255,0,128,0.7)] flex items-center justify-between animate-in fade-in">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white ml-2 text-xs">✕</button>
          </div>
        )}

        {/* View 1: Library */}
        {view === 'library' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ff99cc]" />
              <input
                type="text"
                placeholder="Search characters by name or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCharacters.map((char) => (
                <div
                  key={char.id}
                  className="bg-[#1a0515] border border-[#ff3399]/40 hover:border-[#ff3399] rounded-2xl p-4 shadow-lg hover:shadow-[0_0_20px_rgba(255,51,153,0.3)] transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={char.avatar || '/lucious.jpg'}
                      alt={char.name}
                      onError={(e) => {
                        e.currentTarget.src = '/lucious.jpg';
                      }}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#ff3399]/50 shadow-md shrink-0"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-[#ff99cc] transition-colors">
                          {char.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => exportCharacterJson(char)}
                            title="Export Character JSON"
                            className="p-1 text-[#ffd6eb]/70 hover:text-white rounded"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#ffd6eb]/80 line-clamp-2 leading-relaxed">
                        {char.summary || char.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {char.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.2 rounded-md bg-[#ff007f]/20 border border-[#ff66b2]/30 text-[#ffd6eb] text-[10px] font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#ff3399]/20">
                    <button
                      onClick={() => startEdit(char)}
                      className="text-xs text-[#ffd6eb]/70 hover:text-white transition-colors"
                    >
                      Edit Character
                    </button>

                    <button
                      onClick={() => {
                        onStartChatWithCharacter(char);
                        onClose();
                      }}
                      className="px-4 py-1.5 bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(255,0,128,0.5)] transition-all flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Start Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Create / Edit Form */}
        {view === 'create' && (
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-[#ffd6eb]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-white block">Avatar</label>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#ff3399]/40 bg-[#1e0818] group">
                  <img
                    src={avatar || '/lucious.jpg'}
                    alt="Avatar"
                    onError={(e) => {
                      e.currentTarget.src = '/lucious.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs font-bold">
                    <Upload className="w-5 h-5 mb-1" />
                    <span>Change Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setAvatar(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={avatar.startsWith('data:') ? '' : avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-white">Character Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucious"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Short Summary / Tagline</label>
                  <input
                    type="text"
                    placeholder="Tattooed billionaire syndicate ruler..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 bg-[#1e0818] border border-[#ff3399]/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="px-2.5 py-0.5 rounded-full bg-[#ff007f]/30 border border-[#ff66b2]/50 text-white text-[11px] font-mono cursor-pointer hover:bg-rose-900/50"
                      >
                        {t} &times;
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="font-bold text-white">Description &amp; Appearance</label>
                <textarea
                  rows={3}
                  placeholder="Physical traits, scent, clothing, presence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl p-3 text-xs text-white focus:outline-none font-sans resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Personality &amp; Mannerisms</label>
                <textarea
                  rows={3}
                  placeholder="Protective, dominant, witty, speech cadence..."
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl p-3 text-xs text-white focus:outline-none font-sans resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white">First Message (Greeting) *</label>
              <textarea
                rows={4}
                placeholder="*He steps onto the terrace, his gold watch catching the ambient neon light...* 'Took you long enough...'"
                value={firstMes}
                onChange={(e) => setFirstMes(e.target.value)}
                required
                className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl p-3 text-xs text-white focus:outline-none font-sans resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-white">Scenario Context</label>
                <textarea
                  rows={2}
                  placeholder="Late night at the luxury penthouse..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl p-3 text-xs text-white focus:outline-none font-sans resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-white">Custom System Directives (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Sensory third-person roleplay directives..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-[#1e0818] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl p-3 text-xs text-white focus:outline-none font-sans resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#ff3399]/20">
              <button
                type="button"
                onClick={() => setView('library')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(255,0,128,0.7)] transition-all"
              >
                Save Character
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
