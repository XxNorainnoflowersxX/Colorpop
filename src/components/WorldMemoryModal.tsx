import React, { useState } from 'react';
import {
  X,
  Home,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Car,
  Building,
  Bed,
  Archive,
  Clock,
  Users,
  Key,
  ShieldCheck,
  Eye,
  Check,
} from 'lucide-react';
import { WorldLocation, WorldRoom, Character, Persona } from '../types/roleplay';

interface WorldMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: WorldLocation[];
  characters: Character[];
  personas: Persona[];
  onUpdateLocations: (updated: WorldLocation[]) => void;
  onSetChatScene?: (bgUrl: string) => void;
}

export const WorldMemoryModal: React.FC<WorldMemoryModalProps> = ({
  isOpen,
  onClose,
  locations,
  characters,
  personas,
  onUpdateLocations,
  onSetChatScene,
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || 'loc_penthouse');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    locations[0]?.rooms[0]?.id || 'room_p_terrace'
  );

  // New room modal state
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomImage, setNewRoomImage] = useState('/penthouse.jpg');
  const [newRoomBelongings, setNewRoomBelongings] = useState('');
  const [newRoomFurniture, setNewRoomFurniture] = useState('');
  const [newRoomEvents, setNewRoomEvents] = useState('');

  // New item modal state
  const [newBelongingInput, setNewBelongingInput] = useState('');
  const [newEventInput, setNewEventInput] = useState('');

  if (!isOpen) return null;

  const activeLocation = locations.find((l) => l.id === selectedLocId) || locations[0];
  const activeRoom =
    activeLocation?.rooms.find((r) => r.id === selectedRoomId) || activeLocation?.rooms[0];

  const handleAddBelonging = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBelongingInput.trim() || !activeLocation || !activeRoom) return;

    const updatedRooms = activeLocation.rooms.map((r) =>
      r.id === activeRoom.id ? { ...r, belongings: [...r.belongings, newBelongingInput.trim()] } : r
    );

    const updatedLocations = locations.map((loc) =>
      loc.id === activeLocation.id ? { ...loc, rooms: updatedRooms } : loc
    );

    onUpdateLocations(updatedLocations);
    setNewBelongingInput('');
  };

  const handleAddPastEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventInput.trim() || !activeLocation || !activeRoom) return;

    const updatedRooms = activeLocation.rooms.map((r) =>
      r.id === activeRoom.id ? { ...r, pastEvents: [...r.pastEvents, newEventInput.trim()] } : r
    );

    const updatedLocations = locations.map((loc) =>
      loc.id === activeLocation.id ? { ...loc, rooms: updatedRooms } : loc
    );

    onUpdateLocations(updatedLocations);
    setNewEventInput('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !activeLocation) return;

    const newRoom: WorldRoom = {
      id: `room_${Date.now()}`,
      name: newRoomName.trim(),
      category: 'lounge',
      image: newRoomImage.trim() || '/penthouse.jpg',
      description: newRoomDesc.trim() || 'A luxury bespoke room in the estate.',
      occupantIds: [],
      belongings: newRoomBelongings
        ? newRoomBelongings.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      furniture: newRoomFurniture
        ? newRoomFurniture.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      pastEvents: newRoomEvents
        ? [newRoomEvents.trim()]
        : ['First discovery of this room.'],
    };

    const updatedLocations = locations.map((loc) =>
      loc.id === activeLocation.id ? { ...loc, rooms: [...loc.rooms, newRoom] } : loc
    );

    onUpdateLocations(updatedLocations);
    setSelectedRoomId(newRoom.id);
    setIsAddingRoom(false);
    setNewRoomName('');
    setNewRoomDesc('');
    setNewRoomBelongings('');
    setNewRoomFurniture('');
    setNewRoomEvents('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#12030f] border-2 border-[#ff3399]/60 rounded-3xl shadow-[0_0_60px_rgba(255,0,128,0.5)] overflow-hidden flex flex-col max-h-[92vh] text-[#ffd6eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff3399]/30 bg-[#0a0108]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff007f] via-[#00b4db] to-[#10b981] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,180,219,0.7)]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2
                  className="text-lg font-bold text-white tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  World &amp; House Memory
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  Mansions &bull; Cars &bull; Belongings
                </span>
              </div>
              <p className="text-xs text-[#ffd6eb]/70">
                Explore penthouses, private mansions, hypercars, rooms, furniture, and past memories tied to each room
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingRoom(!isAddingRoom)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] hover:from-[#ff1a8c] text-white text-xs font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(255,0,128,0.6)] transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Room</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#ffd6eb]/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location Tabs (Mansions, Penthouses, Supercars) */}
        <div className="flex items-center space-x-3 px-6 py-3 border-b border-[#ff3399]/20 bg-[#160413] overflow-x-auto text-xs scrollbar-none">
          {locations.map((loc) => {
            const isSelected = selectedLocId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedLocId(loc.id);
                  if (loc.rooms.length > 0) setSelectedRoomId(loc.rooms[0].id);
                }}
                className={`px-3.5 py-1.5 rounded-2xl font-bold transition-all whitespace-nowrap flex items-center space-x-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ff007f] to-[#ff3399] border-[#ff66b2] text-white shadow-[0_0_15px_rgba(255,0,128,0.7)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                }`}
              >
                {loc.type === 'car' ? (
                  <Car className="w-4 h-4 text-cyan-300" />
                ) : loc.type === 'apartment' ? (
                  <Building className="w-4 h-4 text-pink-300" />
                ) : (
                  <Home className="w-4 h-4 text-amber-300" />
                )}
                <span>{loc.name}</span>
                <span className="text-[10px] font-mono opacity-70">({loc.rooms.length} Rooms)</span>
              </button>
            );
          })}
        </div>

        {/* Add Room Modal Drawer */}
        {isAddingRoom && (
          <form
            onSubmit={handleCreateRoom}
            className="p-5 bg-[#1f061b] border-b border-[#ff3399]/30 space-y-3 animate-in slide-in-from-top-3 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-white">
              <span className="flex items-center gap-1.5 text-[#ff99cc]">
                <Plus className="w-4 h-4 text-[#ff007f]" />
                Add New Room to {activeLocation?.name}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRoom(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-white mb-1">Room Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Cinema, Penthouse Vault"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="/penthouse.jpg or https://..."
                  value={newRoomImage}
                  onChange={(e) => setNewRoomImage(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-white mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Atmospheric sensory description of the room..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Character Belongings</label>
                <input
                  type="text"
                  placeholder="Silk Robe, Gold Watch, Champagne"
                  value={newRoomBelongings}
                  onChange={(e) => setNewRoomBelongings(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Furniture</label>
                <input
                  type="text"
                  placeholder="Chesterfield Sofas, Teak Daybed"
                  value={newRoomFurniture}
                  onChange={(e) => setNewRoomFurniture(e.target.value)}
                  className="w-full bg-[#12030e] border border-[#ff3399]/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRoom(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white font-bold shadow-[0_0_15px_rgba(255,0,128,0.7)]"
              >
                Save Room
              </button>
            </div>
          </form>
        )}

        {/* Main Body: Room Browser & Detailed Memory Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Room Grid in Location (4 cols) */}
          <div className="lg:col-span-4 bg-[#140410] border-r border-[#ff3399]/30 p-4 overflow-y-auto space-y-3">
            <div className="space-y-1 pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-sm">{activeLocation?.name}</h3>
              <p className="text-[11px] text-[#ffd6eb]/70 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#ff66b2]" />
                <span>{activeLocation?.address}</span>
              </p>
              <p className="text-[10px] text-[#ffd6eb]/60 line-clamp-2 pt-1">
                {activeLocation?.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff99cc]">
                Rooms &amp; Compartments ({activeLocation?.rooms.length})
              </span>

              {activeLocation?.rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-[#ff007f]/25 border-[#ff007f] shadow-[0_0_15px_rgba(255,0,128,0.4)]'
                        : 'bg-[#1b0517] border-[#ff3399]/20 hover:border-[#ff3399]/60'
                    }`}
                  >
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{room.name}</h4>
                      <p className="text-[10px] text-[#ffd6eb]/70 truncate">{room.description}</p>
                      <div className="flex items-center space-x-2 text-[9px] font-mono text-[#ff99cc] pt-0.5">
                        <span>{room.belongings.length} Belongings</span>
                        <span>&bull;</span>
                        <span>{room.pastEvents.length} Events</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Room Detail & Memories (8 cols) */}
          <div className="lg:col-span-8 p-5 overflow-y-auto space-y-5 bg-[#0e020c]">
            {activeRoom ? (
              <div className="space-y-5">
                {/* Hero Room Card */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-[#ff3399]/50 aspect-[16/9] max-h-56 shadow-2xl">
                  <img
                    src={activeRoom.image}
                    alt={activeRoom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    {onSetChatScene && (
                      <button
                        onClick={() => onSetChatScene(activeRoom.image)}
                        className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-[#ff007f] border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all shadow"
                      >
                        Set as Chat Backdrop
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff007f]/50 border border-[#ff66b2] text-white uppercase font-bold">
                      {activeLocation?.name} &bull; {activeRoom.name}
                    </span>
                    <h3
                      className="text-xl font-bold text-white drop-shadow"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {activeRoom.name}
                    </h3>
                    <p className="text-xs text-[#ffd6eb]/90 drop-shadow line-clamp-2">
                      {activeRoom.description}
                    </p>
                  </div>
                </div>

                {/* Belongings & Furniture Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Character Belongings */}
                  <div className="p-4 rounded-2xl bg-[#170414] border border-[#ff3399]/30 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-300" />
                        Character Belongings &amp; Items
                      </span>
                      <span className="text-[10px] font-mono text-[#ff99cc]">
                        {activeRoom.belongings.length} Stored
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeRoom.belongings.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-center space-x-1"
                        >
                          <span>💎</span>
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Belonging */}
                    <form onSubmit={handleAddBelonging} className="flex space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add item (e.g. Diamond Ring)..."
                        value={newBelongingInput}
                        onChange={(e) => setNewBelongingInput(e.target.value)}
                        className="flex-1 bg-[#12030e] border border-[#ff3399]/30 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-xl bg-[#ff007f] hover:bg-[#ff1a8c] text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  {/* Room Furniture */}
                  <div className="p-4 rounded-2xl bg-[#170414] border border-[#ff3399]/30 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-cyan-300" />
                        Luxury Furniture &amp; Decor
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {activeRoom.furniture.length} Pieces
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeRoom.furniture.map((furn, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-medium flex items-center space-x-1"
                        >
                          <span>🛋️</span>
                          <span>{furn}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Past Events & Room Memories */}
                <div className="p-4 rounded-2xl bg-[#170414] border border-[#ff3399]/30 space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#ff007f]" />
                      Past Events &amp; Memories in this Room
                    </span>
                    <span className="text-[10px] font-mono text-[#ff99cc]">
                      {activeRoom.pastEvents.length} Recorded
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeRoom.pastEvents.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#ffd6eb]/90 flex items-start space-x-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#ff66b2] shrink-0 mt-0.5" />
                        <p>{evt}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add New Room Memory */}
                  <form onSubmit={handleAddPastEvent} className="flex space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="Record a new memory that happened in this room..."
                      value={newEventInput}
                      onChange={(e) => setNewEventInput(e.target.value)}
                      className="flex-1 bg-[#12030e] border border-[#ff3399]/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white text-xs font-bold shadow"
                    >
                      Record Memory
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-white/50">
                <p>Select a room to view its memory and belongings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
