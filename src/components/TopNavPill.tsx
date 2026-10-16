import React from 'react';
import {
  Home,
  MessageSquare,
  Users,
  BookOpen,
  UserCheck,
  Settings,
  MoreHorizontal,
} from 'lucide-react';

export type NavTab = 'home' | 'chats' | 'characters' | 'lorebooks' | 'personas' | 'settings' | 'more';

interface TopNavPillProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenMoreMenu: () => void;
  rightSlot?: React.ReactNode;
}

export const TopNavPill: React.FC<TopNavPillProps> = ({
  activeTab,
  onChangeTab,
  onOpenMoreMenu,
  rightSlot,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'chats', label: 'Chats', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" /> },
    { id: 'lorebooks', label: 'Lorebooks', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'personas', label: 'Personas', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="w-full flex items-center justify-between gap-2">
      <div className="flex-1 bg-[#12040e]/90 backdrop-blur-md border border-[#ff4d94]/40 rounded-full p-1.5 flex items-center justify-between shadow-[0_0_25px_rgba(255,51,153,0.3)] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white shadow-[0_0_20px_rgba(255,0,128,0.7)] scale-[1.02]'
                  : 'text-[#ffb3d9]/80 hover:text-white hover:bg-[#2a0820]/60'
              }`}
            >
              {tab.icon}
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenMoreMenu}
          className={`flex items-center space-x-1 px-2.5 sm:px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'more'
              ? 'bg-gradient-to-r from-[#ff007f] to-[#ff3399] text-white shadow-[0_0_20px_rgba(255,0,128,0.7)]'
              : 'text-[#ffb3d9]/80 hover:text-white hover:bg-[#2a0820]/60'
          }`}
          title="More options (Plugins, Settings, GitHub)"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">More</span>
        </button>
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </nav>
  );
};
