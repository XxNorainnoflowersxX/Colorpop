import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  UserPlus,
  BookPlus,
  Contact,
  Link2,
  Users,
  BookOpen,
  MessageCircle,
  Image as ImageIcon,
  Puzzle,
  FileText,
  Settings,
  MoreHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Dices,
  Plus,
  Shuffle,
  Eye,
} from 'lucide-react';
import { GalleryImage } from '../types/roleplay';
import { INITIAL_GALLERY_IMAGES } from '../lib/defaultData';

interface ColorPopHeroProps {
  galleryImages: GalleryImage[];
  onOpenGallery: (initialAlbum?: string) => void;
  onQuickAction: (actionId: string) => void;
  onOpenCharacterModal: () => void;
  onOpenLorebookModal: () => void;
  onOpenPersonaModal: () => void;
  onOpenChats: () => void;
  onOpenPlugins: () => void;
  onOpenSettings: () => void;
}

export const ColorPopHero: React.FC<ColorPopHeroProps> = ({
  galleryImages,
  onOpenGallery,
  onQuickAction,
  onOpenCharacterModal,
  onOpenLorebookModal,
  onOpenPersonaModal,
  onOpenChats,
  onOpenPlugins,
  onOpenSettings,
}) => {
  // Filter exclusively for images added to the "showcase" album
  const showcaseImages = (galleryImages && galleryImages.length > 0)
    ? galleryImages.filter((img) => img.album?.trim().toLowerCase() === 'showcase')
    : INITIAL_GALLERY_IMAGES.filter((img) => img.album?.toLowerCase() === 'showcase');

  // Fallback if user emptied showcase
  const activeList = showcaseImages.length > 0
    ? showcaseImages
    : INITIAL_GALLERY_IMAGES.filter((img) => img.album?.toLowerCase() === 'showcase');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [randomSpinning, setRandomSpinning] = useState(false);

  // Keep index within bounds if items change
  useEffect(() => {
    if (currentIndex >= activeList.length) {
      setCurrentIndex(0);
    }
  }, [activeList.length, currentIndex]);

  const currentImage = activeList[currentIndex] || activeList[0];

  // Wheel Carousel Navigation
  const handleNext = () => {
    if (activeList.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    if (activeList.length <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Pull Random Image from "showcase" album only
  const handlePullRandom = () => {
    if (activeList.length <= 1) return;
    setRandomSpinning(true);
    setIsAnimating(true);

    let nextIdx = Math.floor(Math.random() * activeList.length);
    if (nextIdx === currentIndex && activeList.length > 1) {
      nextIdx = (nextIdx + 1) % activeList.length;
    }

    setTimeout(() => {
      setCurrentIndex(nextIdx);
      setIsAnimating(false);
      setRandomSpinning(false);
    }, 250);
  };

  // Touch and Mouse Swipe Gestures for the Wheel
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diffX = e.clientX - mouseStartX.current;
    if (Math.abs(diffX) > 45) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    isDragging.current = false;
    mouseStartX.current = null;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    mouseStartX.current = null;
  };

  // The 12 Jewel Quick Action Buttons (Rendered with extra large colorful circles)
  const quickLinks = [
    {
      id: 'loreberry',
      label: 'Loreberry',
      icon: <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-300 fill-pink-500/40" />,
      glow: 'from-pink-600 via-rose-500 to-fuchsia-600',
      action: () => onQuickAction('loreberry'),
    },
    {
      id: 'create_char',
      label: 'Create Character',
      icon: <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-blue-200" />,
      glow: 'from-blue-600 via-cyan-500 to-indigo-600',
      action: onOpenCharacterModal,
    },
    {
      id: 'create_lore',
      label: 'Create Lorebook',
      icon: <BookPlus className="w-7 h-7 sm:w-8 sm:h-8 text-rose-200" />,
      glow: 'from-rose-600 via-amber-500 to-orange-600',
      action: onOpenLorebookModal,
    },
    {
      id: 'create_persona',
      label: 'Create Persona',
      icon: <Contact className="w-7 h-7 sm:w-8 sm:h-8 text-purple-200" />,
      glow: 'from-purple-600 via-pink-500 to-violet-600',
      action: onOpenPersonaModal,
    },
    {
      id: 'chub_ai',
      label: 'Chub AI',
      icon: <Link2 className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200" />,
      glow: 'from-cyan-600 via-blue-500 to-teal-500',
      action: () => window.open('https://chub.ai', '_blank'),
    },
    {
      id: 'characters',
      label: 'Characters',
      icon: <Users className="w-7 h-7 sm:w-8 sm:h-8 text-amber-200" />,
      glow: 'from-amber-500 via-orange-500 to-yellow-600',
      action: () => onQuickAction('characters'),
    },
    {
      id: 'lorebooks',
      label: 'Lorebooks',
      icon: <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-orange-200" />,
      glow: 'from-orange-600 via-rose-500 to-pink-600',
      action: () => onQuickAction('lorebooks'),
    },
    {
      id: 'my_chats',
      label: 'My Chats',
      icon: <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-pink-200" />,
      glow: 'from-pink-600 via-purple-600 to-rose-600',
      action: onOpenChats,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-200" />,
      glow: 'from-emerald-500 via-teal-500 to-cyan-600',
      action: () => onOpenGallery('showcase'),
    },
    {
      id: 'plugins',
      label: 'Plugins',
      icon: <Puzzle className="w-7 h-7 sm:w-8 sm:h-8 text-fuchsia-200" />,
      glow: 'from-fuchsia-600 via-pink-600 to-purple-600',
      action: onOpenPlugins,
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-rose-200" />,
      glow: 'from-rose-600 via-red-500 to-amber-600',
      action: () => onQuickAction('templates'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-violet-200" />,
      glow: 'from-violet-600 via-indigo-600 to-purple-600',
      action: onOpenSettings,
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 sm:px-6">
      {/* ========================================================================= */}
      {/* LEFT: Top Screen Image Showcase Wheel (Loads only from "showcase" album)   */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 relative group">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-3xl overflow-hidden border-2 border-[#ff3399]/60 shadow-[0_0_40px_rgba(255,51,153,0.5)] bg-[#12040e] aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-auto lg:h-[490px] cursor-grab active:cursor-grabbing select-none transition-all"
        >
          {/* Active Image from "showcase" album with smooth crossfade */}
          <img
            key={currentImage?.id || 'showcase_img'}
            src={currentImage?.url || '/colorpop_hero.jpg'}
            alt={currentImage?.title || 'Showcase Image'}
            className={`w-full h-full object-cover object-center transition-all duration-500 ${
              isAnimating ? 'scale-105 opacity-80 blur-[1px]' : 'scale-100 opacity-100 blur-0'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

          {/* Top Bar Controls on Wheel */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            {/* Album Badge */}
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#ff007f]/60 backdrop-blur-md border border-[#ff80bf]/70 text-white font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,128,0.7)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Showcase Album &bull; {currentIndex + 1} of {activeList.length}
              </span>
            </div>

            {/* Quick Actions: Pull Random from Showcase + Add to Showcase Gallery */}
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePullRandom();
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-[#ff007f] border border-white/30 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all active:scale-95 ${
                  randomSpinning ? 'ring-2 ring-amber-400 bg-[#ff007f]' : ''
                }`}
                title="Pull a random image from the Showcase album only"
              >
                <Dices className={`w-4 h-4 text-pink-300 ${randomSpinning ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Pull Random</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGallery('showcase');
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-xs font-bold text-white shadow backdrop-blur-md transition-all hover:scale-105"
                title="Manage Showcase Album & Add Images"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden sm:inline">Add to Showcase</span>
              </button>
            </div>
          </div>

          {/* Wheel Carousel Arrows: Left & Right */}
          {activeList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff007f] border border-white/30 text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all hover:scale-110 active:scale-90"
                title="Previous showcase image (Swipe left)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff007f] border border-white/30 text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all hover:scale-110 active:scale-90"
                title="Next showcase image (Swipe right)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Banner Content & Wheel Index Dots */}
          <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-[#ff99cc] uppercase tracking-wider font-bold">
                    Swipeable Gallery Wheel &bull; Album: “showcase”
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {currentImage?.title || 'The Sovereign Billionaires • Chapter IV'}
                </h2>
                {currentImage?.caption && (
                  <p className="text-xs text-[#ffd6eb]/90 drop-shadow line-clamp-2">
                    {currentImage.caption}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onOpenGallery('showcase')}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl shadow backdrop-blur-md transition-all flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Gallery</span>
                </button>

                <button
                  onClick={onOpenChats}
                  className="px-4 py-2 bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] hover:to-[#ff4da6] text-white text-xs font-bold rounded-2xl shadow-[0_0_20px_rgba(255,0,128,0.8)] transition-all flex items-center space-x-1.5 hover:scale-105 active:scale-95"
                >
                  <span>Enter Story</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* Carousel Wheel Dots / Mini Thumbnails */}
            {activeList.length > 1 && (
              <div className="flex items-center justify-between pt-1 border-t border-white/15">
                <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
                  {activeList.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative rounded-lg overflow-hidden transition-all shrink-0 ${
                        idx === currentIndex
                          ? 'w-10 h-7 ring-2 ring-[#ff007f] shadow-[0_0_12px_rgba(255,0,128,0.8)] scale-110'
                          : 'w-7 h-5 opacity-50 hover:opacity-100'
                      }`}
                      title={img.title}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-[#ffd6eb]/70 hidden sm:block">
                  Swipe horizontal or click arrows to rotate wheel
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT: Quick Links Sidebar with LARGER COLORFUL CIRCLES (Jewels)         */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 bg-[#140410]/90 backdrop-blur-md border-2 border-[#ff3399]/40 rounded-3xl p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(255,51,153,0.3)]">
        <div className="flex items-center justify-between border-b border-[#ff3399]/30 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <h3
              className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#ff99cc] to-[#ff3399]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quick Links
            </h3>
            <span className="text-xs text-[#ff4d94]">&#10084;</span>
          </div>
          <button
            onClick={() => onQuickAction('gallery')}
            className="text-[#ff99cc] hover:text-white transition-colors text-xs font-semibold"
          >
            Explore
          </button>
        </div>

        {/* 12 Larger Colorful Circle Jewel Buttons */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-3 my-auto py-1">
          {quickLinks.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center justify-center space-y-2 group p-1.5 rounded-2xl hover:bg-[#250720]/60 transition-all cursor-pointer"
            >
              {/* Extra Large Glowing Circle Jewel */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#ffffff]/50 via-[#ff66b2] to-[#ffffff]/90 shadow-[0_0_20px_rgba(255,77,148,0.5)] group-hover:shadow-[0_0_30px_rgba(255,77,148,0.9)] group-hover:scale-110 transition-all duration-300">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-15 md:h-15 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${item.glow} flex items-center justify-center border-2 border-white/50 shadow-inner group-hover:rotate-6 transition-transform`}
                >
                  {item.icon}
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none" />
              </div>

              {/* Label */}
              <span className="text-[11px] sm:text-xs font-bold text-[#ffd6eb] group-hover:text-white text-center leading-tight transition-colors line-clamp-1 drop-shadow">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
