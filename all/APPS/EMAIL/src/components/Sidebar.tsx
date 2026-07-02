import React from 'react';
import { 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Trash2, 
  AlertOctagon, 
  Plus, 
  Settings, 
  Sun, 
  Moon,
  LogIn
} from 'lucide-react';
import type { UserProfile } from '../types';
import { gmailService } from '../services/gmailService';

interface SidebarProps {
  currentFolder: string;
  onSelectFolder: (folder: string) => void;
  onOpenCompose: () => void;
  onOpenSettings: () => void;
  isLiveMode: boolean;
  userProfile: UserProfile;
  unreadCounts: { [key: string]: number };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFolder,
  onSelectFolder,
  onOpenCompose,
  onOpenSettings,
  isLiveMode,
  userProfile,
  unreadCounts,
  isDarkMode,
  onToggleDarkMode
}) => {
  const folders = [
    { id: 'INBOX', name: 'Inbox', icon: Inbox },
    { id: 'SENT', name: 'Sent', icon: Send },
    { id: 'DRAFT', name: 'Drafts', icon: FileText },
    { id: 'STARRED', name: 'Starred', icon: Star },
    { id: 'SPAM', name: 'Spam', icon: AlertOctagon },
    { id: 'TRASH', name: 'Trash', icon: Trash2 },
  ];

  const handleLogin = async () => {
    try {
      await gmailService.login();
    } catch (err: any) {
      alert(err.message || 'Failed to authenticate with Google. Verify your Client ID is valid.');
    }
  };

  return (
    <div className="sidebar-panel">
      {/* App Logo */}
      <div className="sidebar-header">
        <img src="/Brand%20Logo.png" alt="MyMail Logo" className="logo-image" style={{ width: 32, height: 32, borderRadius: '8px', objectFit: 'contain' }} />
        <span className="logo-text">MyMail</span>
      </div>

      {/* Compose Button */}
      <button className="compose-btn" onClick={onOpenCompose}>
        <Plus size={18} />
        Compose
      </button>

      {/* Navigation Folder List */}
      <nav className="sidebar-nav">
        {folders.map((folder) => {
          const FolderIcon = folder.icon;
          const count = unreadCounts[folder.id] || 0;
          const isActive = currentFolder === folder.id;

          return (
            <div
              key={folder.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <div className="nav-item-content">
                <FolderIcon size={18} />
                <span>{folder.name}</span>
              </div>
              {count > 0 && <span className="nav-badge">{count}</span>}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer Operations */}
      <div className="sidebar-footer">

        {/* Action Controls */}
        <div className="footer-buttons">
          {isLiveMode ? (
            <button className="footer-btn" onClick={onOpenSettings}>
              <Settings size={14} />
              Settings
            </button>
          ) : (
            <>
              <button className="footer-btn" onClick={handleLogin} style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                <LogIn size={14} />
                Sync Gmail
              </button>
              <button className="footer-btn" onClick={onOpenSettings}>
                <Settings size={14} />
              </button>
            </>
          )}
        </div>

        {/* Theme Toggler */}
        <div className="theme-switch">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            <span>{isDarkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <div 
            className={`switch-control ${isDarkMode ? 'active' : ''}`} 
            onClick={onToggleDarkMode}
          >
            <div className="switch-knob"></div>
          </div>
        </div>

        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 4 }}>
          {userProfile.imageUrl ? (
            <img 
              src={userProfile.imageUrl} 
              alt={userProfile.name} 
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
            />
          ) : (
            <div className="avatar">{userProfile.name.charAt(0).toUpperCase()}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile.email}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
