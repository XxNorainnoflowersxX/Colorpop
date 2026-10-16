import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Flame,
  CheckCircle2,
  Users,
  Mail,
  Camera,
  Hash,
} from 'lucide-react';
import { SocialMediaPost, SocialStory, SocialDM, Character, Persona } from '../types/roleplay';

interface SocialSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: SocialMediaPost[];
  stories: SocialStory[];
  dms: SocialDM[];
  characters: Character[];
  personas: Persona[];
  onUpdatePosts: (updated: SocialMediaPost[]) => void;
  onUpdateDMs: (updated: SocialDM[]) => void;
}

export const SocialSimulatorModal: React.FC<SocialSimulatorModalProps> = ({
  isOpen,
  onClose,
  posts,
  stories,
  dms,
  characters,
  personas,
  onUpdatePosts,
  onUpdateDMs,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'dms' | 'trends'>('feed');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('/penthouse.jpg');
  const [isPosting, setIsPosting] = useState(false);

  // DM reply state
  const [selectedDMId, setSelectedDMId] = useState<string>(dms[0]?.id || '');
  const [dmReplyText, setDmReplyText] = useState('');

  if (!isOpen) return null;

  const activePersona = personas.find((p) => p.is_default) || personas[0];

  const handleLike = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }
      return p;
    });
    onUpdatePosts(updated);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      authorId: activePersona?.id || 'persona_user',
      authorName: activePersona?.name || 'The Muse',
      authorAvatar: activePersona?.avatar || '/colorpop_hero.jpg',
      content: text,
      timestamp: Date.now(),
      likes: 1,
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    onUpdatePosts(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: SocialMediaPost = {
      id: `post_${Date.now()}`,
      authorId: activePersona?.id || 'persona_user',
      authorName: activePersona?.name || 'The Muse',
      authorAvatar: activePersona?.avatar || '/colorpop_hero.jpg',
      authorHandle: `@${(activePersona?.name || 'muse').toLowerCase().replace(/\s+/g, '')}.elite`,
      reputationBadge: 'Iconic Muse',
      content: newPostText.trim(),
      image: newPostImage || undefined,
      timestamp: Date.now(),
      likes: 1,
      isLiked: true,
      comments: [
        {
          id: `comm_auto_${Date.now()}`,
          authorId: 'char_lucious',
          authorName: 'Lucious Vance',
          authorAvatar: '/lucious.jpg',
          content: 'You always know how to make a statement. Save a dance for me.',
          timestamp: Date.now() + 500,
          likes: 14,
        },
      ],
      tags: ['Luxury', 'Elite', 'ColorPop'],
      location: 'ColorPop Sovereign District',
    };

    onUpdatePosts([newPost, ...posts]);
    setNewPostText('');
    setIsPosting(false);
  };

  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmReplyText.trim()) return;

    const newDM: SocialDM = {
      id: `dm_${Date.now()}`,
      senderId: 'user',
      senderName: activePersona?.name || 'You',
      senderAvatar: activePersona?.avatar || '/colorpop_hero.jpg',
      content: dmReplyText.trim(),
      timestamp: Date.now(),
      isUnread: false,
    };

    onUpdateDMs([...dms, newDM]);
    setDmReplyText('');
  };

  const trendingTopics = [
    { tag: '#SovereignBillionaireGala', postsCount: '142K Posts', desc: 'Ballroom scandal and late-night balcony rendezvous.' },
    { tag: '#ValentinaMcLaren', postsCount: '98K Posts', desc: 'Valentina breaks coastal highway speed record.' },
    { tag: '#SkyfallPenthouse', postsCount: '76K Posts', desc: 'Lucious Vance hosts VIP summit at 2 AM.' },
    { tag: '#SecretAffair', postsCount: '54K Posts', desc: 'Whispers of forbidden luxury romance in Beverly Hills.' },
    { tag: '#UndergroundVelvet', postsCount: '31K Posts', desc: 'Private invitations to the subterranean lounge.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#12030f] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_60px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[92vh] text-[#ffd6eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0a0108]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff007f] via-[#9b51e0] to-[#ff3399] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,0,128,0.7)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  className="text-lg font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  VanceGram &bull; Social Media Simulator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff3399]/40 text-[#ff99cc]">
                  NPC Gossip &amp; Dynamic Feed
                </span>
              </div>
              <p className="text-xs text-[#ffd6eb]/70">
                NPCs post stories, gossip, spicy comments, and DM you based on current roleplay events
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPosting(!isPosting)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] text-white text-xs font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,0,128,0.6)] transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Create Post</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-6 py-2.5 border-b border-[#ff3399]/20 bg-[#160413] text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'feed'
                ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <span>Live Feed</span>
            <span className="text-[10px] font-mono opacity-80">({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dms')}
            className={`px-3.5 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'dms'
                ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Messages</span>
            <span className="text-[10px] font-mono px-1.5 rounded-full bg-rose-500/30 text-rose-300">
              {dms.filter((d) => d.isUnread).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-1 rounded-full font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'trends'
                ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,128,0.7)]'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Trending Gossip</span>
          </button>
        </div>

        {/* Stories Bar (At the top of the social network) */}
        <div className="flex items-center space-x-4 px-6 py-3 border-b border-[#ff3399]/20 bg-[#0d020b] overflow-x-auto scrollbar-none">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#ff007f] via-amber-400 to-[#9b51e0] group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(255,0,128,0.5)]">
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  className="w-13 h-13 rounded-full object-cover border-2 border-black"
                />
              </div>
              <span className="text-[10px] font-bold text-white/90 group-hover:text-[#ff99cc] truncate max-w-[65px]">
                {story.authorName}
              </span>
            </div>
          ))}
        </div>

        {/* Create Post Form */}
        {isPosting && (
          <form
            onSubmit={handleCreatePost}
            className="p-5 bg-[#1f061b] border-b border-[#ff3399]/30 space-y-3 animate-in slide-in-from-top-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-white">
              <span className="flex items-center gap-1.5 text-[#ff99cc]">
                <Camera className="w-4 h-4 text-[#ff007f]" />
                Post to VanceGram as {activePersona?.name}
              </span>
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              required
              placeholder="What's happening in your high-society roleplay world?..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-2xl p-3 text-white placeholder-white/30 focus:outline-none"
            />

            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-cyan-300 shrink-0" />
              <input
                type="text"
                placeholder="Optional image URL (/penthouse.jpg, /roadtrip.jpg, etc.)"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                className="flex-1 bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPosting(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold shadow-[0_0_15px_rgba(255,0,128,0.7)]"
              >
                Share Post
              </button>
            </div>
          </form>
        )}

        {/* Tab 1: Live Feed */}
        {activeTab === 'feed' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-3xl bg-[#170414] border border-[#ff3399]/40 shadow-xl overflow-hidden text-xs"
                >
                  {/* Post Author Bar */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ff007f]"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-white text-sm">{post.authorName}</h4>
                          <span className="text-[10px] text-[#ff99cc] font-mono">{post.authorHandle}</span>
                        </div>
                        {post.location && (
                          <p className="text-[10px] text-[#ffd6eb]/60">{post.location}</p>
                        )}
                      </div>
                    </div>

                    {post.reputationBadge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff007f]/40 text-[#ffb3d9] font-bold text-[10px]">
                        {post.reputationBadge}
                      </span>
                    )}
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="relative aspect-video max-h-72 overflow-hidden bg-black">
                      <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  {/* Post Content & Actions */}
                  <div className="p-4 space-y-3">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1.5 font-bold transition-all ${
                            post.isLiked ? 'text-[#ff007f] scale-110' : 'text-white/70 hover:text-white'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${post.isLiked ? 'fill-[#ff007f]' : ''}`}
                          />
                          <span>{post.likes.toLocaleString()}</span>
                        </button>

                        <button className="flex items-center space-x-1.5 text-white/70 hover:text-white">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments.length}</span>
                        </button>

                        <button className="text-white/70 hover:text-white">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>

                      <button className="text-white/70 hover:text-[#ff99cc]">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Text Body */}
                    <p className="text-white/95 leading-relaxed">{post.content}</p>

                    {/* Tags */}
                    {post.tags && (
                      <div className="flex flex-wrap gap-1 text-[11px] text-[#ff66b2] font-semibold">
                        {post.tags.map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Comments Section */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        {post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="flex items-start space-x-2 text-[11px] bg-black/30 p-2 rounded-xl"
                          >
                            <img
                              src={comm.authorAvatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="font-bold text-white mr-1.5">{comm.authorName}</span>
                              <span className="text-[#ffd6eb]/90">{comm.content}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a comment as your persona..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 bg-[#12030e] border border-[#ff3399]/30 rounded-xl px-3 py-1.5 text-white placeholder-white/40 focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-bold"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Direct Messages Simulation */}
        {activeTab === 'dms' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
            {/* DM List */}
            <div className="md:col-span-5 bg-[#140410] border-r border-[#ff3399]/30 p-4 overflow-y-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff99cc]">
                Conversations ({dms.length})
              </span>

              {dms.map((dm) => (
                <div
                  key={dm.id}
                  onClick={() => setSelectedDMId(dm.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                    selectedDMId === dm.id
                      ? 'bg-[#ff007f]/25 border-[#ff007f]'
                      : 'bg-[#1b0517] border-white/10 hover:border-[#ff3399]/40'
                  }`}
                >
                  <img
                    src={dm.senderAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-[#ff007f]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs truncate">{dm.senderName}</h4>
                      <span className="text-[9px] font-mono text-white/50">
                        {new Date(dm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#ffd6eb]/70 truncate">{dm.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* DM Thread & Reply */}
            <div className="md:col-span-7 p-5 flex flex-col justify-between bg-[#0e020c]">
              <div className="space-y-3 overflow-y-auto flex-1">
                {dms.map((dm) => {
                  const isUser = dm.senderId === 'user';
                  return (
                    <div
                      key={dm.id}
                      className={`flex items-start space-x-2 max-w-md ${
                        isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
                      }`}
                    >
                      <img
                        src={dm.senderAvatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white rounded-tr-none'
                            : 'bg-[#1b0516] border border-[#ff3399]/40 text-[#ffd6eb] rounded-tl-none'
                        }`}
                      >
                        <span className="block font-bold text-[10px] text-white/70 mb-0.5">
                          {dm.senderName}
                        </span>
                        {dm.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendDM} className="flex space-x-2 pt-3 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Send a private DM reply..."
                  value={dmReplyText}
                  onChange={(e) => setDmReplyText(e.target.value)}
                  className="flex-1 bg-[#12030e] border border-[#ff3399]/30 rounded-2xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,0,128,0.7)]"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Trending Topics & Gossip */}
        {activeTab === 'trends' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-white pb-2 border-b border-white/10">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Trending Rumors &amp; High-Society Gossip</span>
              </div>

              {trendingTopics.map((trend, idx) => (
                <div
                  key={trend.tag}
                  className="p-4 rounded-2xl bg-[#170414] border border-[#ff3399]/30 flex items-center justify-between space-x-3 hover:border-[#ff3399] transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-white/40">#{idx + 1} Trending in ColorPop</span>
                    <h4 className="font-bold text-white text-sm text-[#ff99cc]">{trend.tag}</h4>
                    <p className="text-xs text-[#ffd6eb]/70">{trend.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                    {trend.postsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
