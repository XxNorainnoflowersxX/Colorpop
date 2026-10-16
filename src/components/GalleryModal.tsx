import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Folder,
  Upload,
  Layers,
  Heart,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { GalleryImage, Persona } from '../types/roleplay';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryImages: GalleryImage[];
  personas?: Persona[];
  onAddImage: (image: GalleryImage) => void;
  onDeleteImage: (imageId: string) => void;
  onSelectChatBackground?: (imageUrl: string) => void;
  initialAlbum?: string;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  galleryImages,
  personas = [],
  onAddImage,
  onDeleteImage,
  onSelectChatBackground,
  initialAlbum = 'showcase',
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>(initialAlbum);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAlbum, setNewAlbum] = useState(initialAlbum);
  const [newCaption, setNewCaption] = useState('');
  const [newTags, setNewTags] = useState('');
  const [activePreviewImage, setActivePreviewImage] = useState<GalleryImage | null>(null);

  // Sync selected album when modal opens or initialAlbum prop changes
  React.useEffect(() => {
    if (isOpen && initialAlbum) {
      setSelectedAlbum(initialAlbum);
      setNewAlbum(initialAlbum);
    }
  }, [isOpen, initialAlbum]);

  // Compute unified gallery including persona gallery profiles immediately
  const effectiveImages = React.useMemo(() => {
    const list = [...galleryImages];
    const seenUrls = new Set(list.map((img) => img.url));
    const seenIds = new Set(list.map((img) => img.id));

    if (personas && personas.length > 0) {
      personas.forEach((p) => {
        const pId = `persona_gal_${p.id}`;
        const avatarUrl = p.avatar || '/colorpop_hero.jpg';
        if (!seenIds.has(pId) && !seenUrls.has(avatarUrl)) {
          list.push({
            id: pId,
            url: avatarUrl,
            title: p.display_name || p.name,
            album: 'personas',
            caption: p.description?.slice(0, 120) || p.speaking_style || 'User persona profile',
            tags: ['Persona', ...(p.traits || [])],
            createdAt: p.createdAt || new Date().toISOString(),
          });
          seenUrls.add(avatarUrl);
          seenIds.add(pId);
        }
      });
    }

    return list;
  }, [galleryImages, personas]);

  if (!isOpen) return null;

  // Extract distinct album names - always feature showcase, characters, and personas
  const allAlbums = Array.from(
    new Set(['showcase', 'characters', 'personas', ...effectiveImages.map((img) => img.album.trim().toLowerCase())])
  );

  const filteredImages =
    selectedAlbum === 'all'
      ? effectiveImages
      : effectiveImages.filter((img) => img.album.trim().toLowerCase() === selectedAlbum.toLowerCase());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) return;

    const img: GalleryImage = {
      id: `img_${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      album: (newAlbum || 'showcase').trim().toLowerCase(),
      caption: newCaption.trim() || undefined,
      tags: newTags
        ? newTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Luxury'],
      createdAt: new Date().toISOString(),
    };

    onAddImage(img);
    setNewTitle('');
    setNewUrl('');
    setNewCaption('');
    setNewTags('');
    setIsAddingNew(false);
    setSelectedAlbum(img.album);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewUrl(event.target.result as string);
          if (!newTitle) {
            setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#140410] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_50px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[90vh] text-[#ffd6eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0d020b]">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-[#ff007f] text-[#ffd6eb] hover:text-white transition-all flex items-center space-x-1.5 shadow shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00b4db] to-[#0083b0] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,180,219,0.6)] shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  className="text-lg font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Visual Gallery &amp; Albums
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff3399]/40 text-[#ff99cc]">
                  Showcase Wheel Connected
                </span>
              </div>
              <p className="text-xs text-[#ffd6eb]/70">
                Images in the “showcase” album automatically display on the home screen top wheel
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white text-xs font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,0,128,0.6)] transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Albums Filter Bar */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-[#ff3399]/20 bg-[#1a0515]/60 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              selectedAlbum === 'all'
                ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                : 'bg-white/5 hover:bg-white/10 text-[#ffd6eb]/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Albums ({effectiveImages.length})</span>
          </button>

          {allAlbums.map((alb) => {
            const isShowcase = alb.toLowerCase() === 'showcase';
            const count = effectiveImages.filter(
              (img) => img.album.trim().toLowerCase() === alb.toLowerCase()
            ).length;

            return (
              <button
                key={alb}
                onClick={() => setSelectedAlbum(alb)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedAlbum.toLowerCase() === alb.toLowerCase()
                    ? isShowcase
                      ? 'bg-gradient-to-r from-[#ff007f] to-[#9b51e0] text-white shadow-[0_0_15px_rgba(255,0,128,0.7)]'
                      : 'bg-[#ff3399] text-white'
                    : isShowcase
                    ? 'bg-[#ff007f]/20 border border-[#ff007f]/40 text-[#ffb3d9] hover:bg-[#ff007f]/30'
                    : 'bg-white/5 hover:bg-white/10 text-[#ffd6eb]/80'
                }`}
              >
                {isShowcase ? <Sparkles className="w-3.5 h-3.5 text-amber-300" /> : <Folder className="w-3.5 h-3.5" />}
                <span className="capitalize">{alb}</span>
                {isShowcase && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
                    Home Wheel
                  </span>
                )}
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Add New Image Drawer / Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreate}
            className="p-5 bg-[#20061b] border-b border-[#ff3399]/30 space-y-3 animate-in slide-in-from-top-3 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-[#ff99cc]">
                <Plus className="w-4 h-4 text-[#ff007f]" />
                Add Image to Gallery &amp; Showcase Wheel
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Penthouse Romance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#140410] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Album *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="showcase"
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    className="flex-1 bg-[#140410] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3 py-2 text-white font-mono placeholder-white/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setNewAlbum('showcase')}
                    className="px-2.5 py-1 rounded-xl bg-[#ff007f]/30 border border-[#ff007f] text-[#ff99cc] font-bold text-[11px] hover:bg-[#ff007f]/50"
                  >
                    Set “showcase”
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-white mb-1">Image URL or Local Upload *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... or /penthouse.jpg or upload below"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 bg-[#140410] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3 py-2 text-white font-mono placeholder-white/30 focus:outline-none text-[11px]"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Caption / Story Description</label>
                <input
                  type="text"
                  placeholder="Atmospheric caption for the showcase wheel..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full bg-[#140410] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Luxury, Penthouse, Romance"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-[#140410] border border-[#ff3399]/40 focus:border-[#ff3399] rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,0,128,0.7)] hover:scale-105 transition-all"
              >
                Save Image
              </button>
            </div>
          </form>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ImageIcon className="w-12 h-12 text-[#ff3399]/40 mx-auto" />
              <p className="text-sm font-bold text-white">No images in album “{selectedAlbum}”</p>
              <p className="text-xs text-[#ffd6eb]/60">
                Click “Add Image” above to add pictures to this album.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((img) => {
                const isShowcase = img.album.trim().toLowerCase() === 'showcase';

                return (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden border border-[#ff3399]/40 hover:border-[#ff3399] bg-[#1a0515] shadow-lg hover:shadow-[0_0_20px_rgba(255,51,153,0.5)] transition-all duration-300 flex flex-col justify-between aspect-[3/4] cursor-pointer"
                    onClick={() => setActivePreviewImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/colorpop_hero.jpg';
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="relative p-2 flex items-center justify-between z-10">
                      {isShowcase ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff007f]/80 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 shadow">
                          <Sparkles className="w-2.5 h-2.5" /> Showcase Wheel
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#ffd6eb]/80 capitalize">
                          {img.album}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${img.title}" from gallery?`)) {
                            onDeleteImage(img.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white transition-opacity"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative p-3 z-10 space-y-1">
                      <h4 className="text-xs font-bold text-white truncate drop-shadow group-hover:text-[#ff99cc] transition-colors">
                        {img.title}
                      </h4>
                      {img.caption && (
                        <p className="text-[10px] text-[#ffd6eb]/80 line-clamp-1 drop-shadow">
                          {img.caption}
                        </p>
                      )}

                      {onSelectChatBackground && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectChatBackground(img.url);
                          }}
                          className="w-full mt-1 py-1 rounded-lg bg-[#ff007f]/40 hover:bg-[#ff007f] text-white text-[10px] font-bold transition-all text-center"
                        >
                          Use as Chat Backdrop
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full Image Preview Modal */}
        {activePreviewImage && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in"
            onClick={() => setActivePreviewImage(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#180517] border-2 border-[#ff3399] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,0,128,0.7)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video max-h-[60vh] bg-black">
                <img
                  src={activePreviewImage.url}
                  alt={activePreviewImage.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/colorpop_hero.jpg';
                  }}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setActivePreviewImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-[#ff007f] text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff99cc] px-2 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff007f]/40">
                    Album: {activePreviewImage.album}
                  </span>
                  <h3 className="text-lg font-bold text-white">{activePreviewImage.title}</h3>
                  {activePreviewImage.caption && (
                    <p className="text-xs text-[#ffd6eb]/80">{activePreviewImage.caption}</p>
                  )}
                </div>

                {onSelectChatBackground && (
                  <button
                    onClick={() => {
                      onSelectChatBackground(activePreviewImage.url);
                      setActivePreviewImage(null);
                    }}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,0,128,0.7)] hover:scale-105 transition-all"
                  >
                    Set as Scene Background
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
