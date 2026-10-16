import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Sparkles,
  Heart,
  ShieldAlert,
  Flame,
  EyeOff,
  Users,
  Compass,
  Plus,
  Trash2,
  Sliders,
  Maximize2,
  Info,
  Layers,
  Crown,
} from 'lucide-react';
import { Character, Persona, RelationshipEdge, RelationshipType } from '../types/roleplay';

interface RelationshipMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  personas: Persona[];
  relationships: RelationshipEdge[];
  onUpdateRelationships: (updated: RelationshipEdge[]) => void;
}

const TYPE_CONFIG: Record<
  RelationshipType,
  { label: string; color: string; glow: string; icon: string }
> = {
  marriage: { label: 'Marriage', color: '#eab308', glow: 'rgba(234, 179, 8, 0.8)', icon: '💍' },
  affair: { label: 'Affair', color: '#ff007f', glow: 'rgba(255, 0, 128, 0.9)', icon: '💋' },
  friendship: { label: 'Friendship', color: '#10b981', glow: 'rgba(16, 185, 129, 0.8)', icon: '🤝' },
  family: { label: 'Family Dynasty', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)', icon: '👑' },
  enemy: { label: 'Bitter Enemy', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.9)', icon: '⚔️' },
  jealousy: { label: 'Jealousy', color: '#a3e635', glow: 'rgba(163, 230, 53, 0.8)', icon: '🔥' },
  secret: { label: 'Hidden Secret', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.9)', icon: '🤫' },
};

export const RelationshipMapModal: React.FC<RelationshipMapModalProps> = ({
  isOpen,
  onClose,
  characters,
  personas,
  relationships,
  onUpdateRelationships,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('char_lucious');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingConnection, setIsAddingConnection] = useState(false);

  // New connection form
  const [newSource, setNewSource] = useState(characters[0]?.id || 'char_lucious');
  const [newTarget, setNewTarget] = useState(personas[0]?.id || 'persona_siren');
  const [newType, setNewType] = useState<RelationshipType>('affair');
  const [newStrength, setNewStrength] = useState(85);
  const [newLabel, setNewLabel] = useState('Secret Liaison');
  const [newSecret, setNewSecret] = useState('Met late at night on the terrace');

  // Combine characters and personas as graph nodes
  const nodes = useMemo(
    () => [
      ...characters.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        role: 'Character',
        isUser: false,
      })),
      ...personas.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        role: 'Your Persona',
        isUser: true,
      })),
    ],
    [characters, personas]
  );

  const typeConfig = TYPE_CONFIG;

  // Filtered edges
  const filteredEdges = useMemo(
    () => (filterType === 'all' ? relationships : relationships.filter((e) => e.type === filterType)),
    [relationships, filterType]
  );

  // 3D Orbit & Canvas Simulation (unconditional hook execution)
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 700;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // Node positioning in 3D orbit
    const render = () => {
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep space luxury grid background
      ctx.strokeStyle = 'rgba(255, 51, 153, 0.08)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calculate 3D circular layout with orbital sway
      angle += 0.003;
      const radiusX = Math.min(width, height) * 0.35;
      const radiusY = Math.min(width, height) * 0.22;

      const nodeCoords = new Map<string, { x: number; y: number; z: number; scale: number }>();

      nodes.forEach((node, index) => {
        const offset = (index / nodes.length) * Math.PI * 2 + angle;
        // 3D perspective projection
        const x3d = Math.cos(offset) * radiusX;
        const z3d = Math.sin(offset) * radiusY;
        const y3d = Math.sin(offset * 2) * 20;

        const fov = 350;
        const scale = fov / (fov + z3d);
        const x2d = centerX + x3d * scale;
        const y2d = centerY + y3d * scale;

        nodeCoords.set(node.id, { x: x2d, y: y2d, z: z3d, scale });
      });

      // Draw Edges (Relationship Beams)
      filteredEdges.forEach((edge) => {
        const src = nodeCoords.get(edge.sourceId);
        const tgt = nodeCoords.get(edge.targetId);
        if (!src || !tgt) return;

        const conf = typeConfig[edge.type] || typeConfig.friendship;
        const isSelected = selectedEdgeId === edge.id;

        ctx.save();
        ctx.strokeStyle = conf.color;
        ctx.lineWidth = isSelected ? 4 : Math.max(1.5, (edge.strength / 100) * 3);
        ctx.shadowColor = conf.glow;
        ctx.shadowBlur = isSelected ? 20 : 10;

        // Curved line with cubic Bezier
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2 - 25;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.quadraticCurveTo(midX, midY, tgt.x, tgt.y);
        ctx.stroke();

        // Pulsating particle along the edge
        const particleT = (Date.now() / 2000 + edge.strength / 100) % 1;
        const px = (1 - particleT) * (1 - particleT) * src.x + 2 * (1 - particleT) * particleT * midX + particleT * particleT * tgt.x;
        const py = (1 - particleT) * (1 - particleT) * src.y + 2 * (1 - particleT) * particleT * midY + particleT * particleT * tgt.y;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = conf.glow;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Label on edge midpoint
        ctx.fillStyle = conf.color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${conf.icon} ${edge.label} (${edge.strength}%)`, midX, midY - 6);
        ctx.restore();
      });

      // Draw Nodes (Characters & Personas) sorted by Z depth
      const sortedNodes = [...nodes].sort((a, b) => {
        const za = nodeCoords.get(a.id)?.z || 0;
        const zb = nodeCoords.get(b.id)?.z || 0;
        return za - zb;
      });

      sortedNodes.forEach((node) => {
        const coord = nodeCoords.get(node.id);
        if (!coord) return;

        const isSelected = selectedNodeId === node.id;
        const nodeRadius = (node.isUser ? 26 : 24) * coord.scale;

        ctx.save();

        // Outer Glow Ring
        if (isSelected) {
          ctx.strokeStyle = '#ff007f';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(255, 0, 128, 0.9)';
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.arc(coord.x, coord.y, nodeRadius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node Circle Body
        ctx.fillStyle = node.isUser ? '#2e0a24' : '#140410';
        ctx.strokeStyle = node.isUser ? '#ff3399' : '#00b4db';
        ctx.lineWidth = 2;
        ctx.shadowColor = node.isUser ? '#ff007f' : '#00b4db';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(coord.x, coord.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Node Name & Tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(11 * coord.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, coord.x, coord.y + nodeRadius + 14);

        ctx.fillStyle = node.isUser ? '#ff99cc' : '#93c5fd';
        ctx.font = `${Math.round(9 * coord.scale)}px monospace`;
        ctx.fillText(node.role, coord.x, coord.y + nodeRadius + 26);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, nodes, filteredEdges, selectedNodeId, selectedEdgeId]);

  if (!isOpen) return null;

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSource === newTarget) return;

    const newEdge: RelationshipEdge = {
      id: `rel_${Date.now()}`,
      sourceId: newSource,
      targetId: newTarget,
      type: newType,
      strength: newStrength,
      label: newLabel.trim() || 'Dynamic Bond',
      secretDescription: newSecret.trim() || undefined,
      isReciprocal: true,
      historyEvents: [`Established bond: ${newLabel}`],
    };

    onUpdateRelationships([newEdge, ...relationships]);
    setIsAddingConnection(false);
  };

  const handleDeleteConnection = (edgeId: string) => {
    onUpdateRelationships(relationships.filter((r) => r.id !== edgeId));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeEdges = relationships.filter(
    (e) => e.sourceId === selectedNodeId || e.targetId === selectedNodeId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#12030f] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_60px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[92vh] text-[#ffd6eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0a0108]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff007f] via-[#9b51e0] to-[#00b4db] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,0,128,0.7)]">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  className="text-lg font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Living Relationship Map
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff007f]/20 border border-[#ff3399]/40 text-[#ff99cc]">
                  3D Dynamic Web
                </span>
              </div>
              <p className="text-xs text-[#ffd6eb]/70">
                Live interactive web of friendships, marriages, enemies, affairs, secrets, family dynasties &amp; jealousy
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingConnection(!isAddingConnection)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] text-white text-xs font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,0,128,0.6)] transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Forge Bond</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 px-6 py-2.5 border-b border-[#ff3399]/20 bg-[#160413] overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider shrink-0 mr-1">
            Filter Bonds:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-[#ff007f] text-white shadow'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            All Connections ({relationships.length})
          </button>
          {Object.entries(typeConfig).map(([key, conf]) => {
            const count = relationships.filter((r) => r.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1 rounded-full font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  filterType === key
                    ? 'text-white shadow'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                }`}
                style={{
                  backgroundColor: filterType === key ? conf.color : undefined,
                }}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Forge Connection Modal Drawer */}
        {isAddingConnection && (
          <form
            onSubmit={handleCreateConnection}
            className="p-5 bg-[#1f061b] border-b border-[#ff3399]/30 space-y-3 animate-in slide-in-from-top-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-white">
              <span className="flex items-center gap-1.5 text-[#ff99cc]">
                <Sparkles className="w-4 h-4 text-[#ff007f]" />
                Forge New Relationship Connection
              </span>
              <button
                type="button"
                onClick={() => setIsAddingConnection(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-white mb-1">Character 1</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Bond Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as RelationshipType)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {Object.entries(typeConfig).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.icon} {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Character 2</label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Bond Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clandestine Lover, Bitter Syndicate Rival"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                </input>
              </div>

              <div>
                <label className="block font-bold text-white mb-1">
                  Relationship Strength: <strong className="text-[#ff66b2]">{newStrength}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newStrength}
                  onChange={(e) => setNewStrength(parseInt(e.target.value, 10))}
                  className="w-full accent-[#ff007f] mt-2"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Hidden Secret / Lore</label>
                <input
                  type="text"
                  placeholder="Secret backstory between these two..."
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingConnection(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold shadow-[0_0_15px_rgba(255,0,128,0.7)]"
              >
                Save Bond
              </button>
            </div>
          </form>
        )}

        {/* Main Body: 3D Canvas Web + Node Inspector Sidebar */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Canvas: 3D Orbiting Connection Web */}
          <div className="lg:col-span-8 relative bg-[#090107] min-h-[380px] sm:min-h-[460px]">
            <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

            {/* Quick Node Selector Pills */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-md">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center space-x-1.5 ${
                    selectedNodeId === node.id
                      ? 'bg-[#ff007f] border-[#ff66b2] text-white shadow-[0_0_12px_rgba(255,0,128,0.8)]'
                      : 'bg-black/60 border-white/20 text-[#ffd6eb]/80 hover:bg-white/10'
                  }`}
                >
                  <img src={node.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span>{node.name}</span>
                </button>
              ))}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/50 pointer-events-none">
              <span>Orbital 3D Simulation &bull; Node Physics Active</span>
              <span>Showing {filteredEdges.length} Active Ties</span>
            </div>
          </div>

          {/* Right Inspector: Details of Selected Character & Relationships */}
          <div className="lg:col-span-4 bg-[#140410] border-t lg:border-t-0 lg:border-l border-[#ff3399]/30 p-5 overflow-y-auto space-y-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-[#ff3399]/30">
                  <img
                    src={selectedNode.avatar}
                    alt={selectedNode.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#ff007f] shadow-[0_0_15px_rgba(255,0,128,0.5)]"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedNode.name}</h3>
                    <p className="text-[11px] text-[#ff99cc]">{selectedNode.role}</p>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {selectedNodeEdges.length} Active Ties
                    </span>
                  </div>
                </div>

                {/* Connection List for this Character */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Bonds &amp; Secrets
                  </h4>

                  {selectedNodeEdges.length === 0 ? (
                    <p className="text-xs text-white/50 italic py-2">
                      No active relationships recorded. Click “Forge Bond” above to create ties.
                    </p>
                  ) : (
                    selectedNodeEdges.map((edge) => {
                      const otherId = edge.sourceId === selectedNode.id ? edge.targetId : edge.sourceId;
                      const otherNode = nodes.find((n) => n.id === otherId);
                      const conf = typeConfig[edge.type] || typeConfig.friendship;

                      return (
                        <div
                          key={edge.id}
                          className="p-3 rounded-2xl bg-[#1b0517] border border-[#ff3399]/30 space-y-2 hover:border-[#ff3399] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{conf.icon}</span>
                              <span className="font-bold text-white text-xs">{edge.label}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteConnection(edge.id)}
                              className="text-white/40 hover:text-rose-400 transition-colors"
                              title="Sever this connection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 text-[11px]">
                            <span className="text-[#ffd6eb]/70">Connected to:</span>
                            <span className="font-bold text-white">{otherNode?.name}</span>
                          </div>

                          {/* Dynamic Strength Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="capitalize" style={{ color: conf.color }}>
                                {edge.type}
                              </span>
                              <span className="font-bold text-white">{edge.strength}% Strength</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${edge.strength}%`,
                                  backgroundColor: conf.color,
                                }}
                              />
                            </div>
                          </div>

                          {edge.secretDescription && (
                            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[10px] text-[#ffd6eb]/80 italic">
                              <span className="font-bold text-amber-300 not-italic">Secret: </span>
                              {edge.secretDescription}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-white/50 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-[#ff3399]/40" />
                <p className="text-xs">Click any character node in the 3D web to inspect ties.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
