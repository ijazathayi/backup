import React from 'react';
import { 
  Search, 
  RotateCw, 
  Trash2, 
  Mail, 
  MailOpen, 
  Archive, 
  Star, 
  Paperclip,
  Check
} from 'lucide-react';
import type { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onToggleStar: (id: string, currentStarred: boolean, e: React.MouseEvent) => void;
  onDeleteEmail: (id: string, e: React.MouseEvent) => void;
  onArchiveEmail: (id: string, e: React.MouseEvent) => void;
  onMarkRead: (id: string, read: boolean, e: React.MouseEvent) => void;
  selectedFolder: string;
  isLiveMode: boolean;
  onConnectGmail: () => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  isLoading,
  selectedEmailId,
  onSelectEmail,
  searchQuery,
  onSearchChange,
  onRefresh,
  onToggleStar,
  onDeleteEmail,
  onArchiveEmail,
  onMarkRead,
  selectedFolder,
  isLiveMode,
  onConnectGmail
}) => {
  // Local state for checkboxes
  const [checkedIds, setCheckedIds] = React.useState<string[]>([]);

  // Reset checked IDs when folder or emails change
  React.useEffect(() => {
    setCheckedIds([]);
  }, [selectedFolder, emails]);

  const handleToggleCheckAll = () => {
    if (checkedIds.length === emails.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(emails.map(e => e.id));
    }
  };

  const handleToggleCheckOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (checkedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to move ${checkedIds.length} selected emails to Trash?`)) {
      for (const id of checkedIds) {
        await onDeleteEmail(id, {} as React.MouseEvent);
      }
      setCheckedIds([]);
      onRefresh();
    }
  };

  const handleBulkMarkRead = async (read: boolean) => {
    if (checkedIds.length === 0) return;
    for (const id of checkedIds) {
      await onMarkRead(id, read, {} as React.MouseEvent);
    }
    setCheckedIds([]);
    onRefresh();
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (d.getFullYear() === now.getFullYear()) {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      return d.toLocaleDateString([], { year: '2-digit', month: 'numeric', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isAllChecked = emails.length > 0 && checkedIds.length === emails.length;

  return (
    <div className="email-list-panel">
      {/* Search and Action Bar */}
      <div className="list-header">
        <div className="search-bar-container">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={`Search in ${selectedFolder.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="list-actions">
          <div className="bulk-controls">
            {emails.length > 0 && (
              <div 
                className={`checkbox-custom ${isAllChecked ? 'checked' : ''}`}
                onClick={handleToggleCheckAll}
                title="Select all"
              >
                {isAllChecked && <Check size={12} />}
              </div>
            )}

            <button 
              className="action-icon-btn" 
              onClick={onRefresh} 
              title="Refresh messages"
              disabled={isLoading}
            >
              <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {checkedIds.length > 0 && (
              <>
                <button 
                  className="action-icon-btn" 
                  onClick={handleBulkDelete}
                  title="Move selected to Trash"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  className="action-icon-btn" 
                  onClick={() => handleBulkMarkRead(true)}
                  title="Mark selected as read"
                >
                  <MailOpen size={16} />
                </button>
                <button 
                  className="action-icon-btn" 
                  onClick={() => handleBulkMarkRead(false)}
                  title="Mark selected as unread"
                >
                  <Mail size={16} />
                </button>
              </>
            )}
          </div>

          <div className="list-meta">
            {isLoading ? 'Syncing...' : `${emails.length} message${emails.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>



      {/* Email List Area */}
      <div className="scrollable-area">
        {isLoading && emails.length === 0 ? (
          // Shimmer loading items
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="email-card animate-pulse" style={{ pointerEvents: 'none' }}>
              <div className="card-left">
                <div className="avatar" style={{ background: 'var(--surface-secondary)' }}></div>
              </div>
              <div className="card-right" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: '40%', height: '12px', background: 'var(--surface-secondary)', borderRadius: 4 }}></div>
                <div style={{ width: '80%', height: '14px', background: 'var(--surface-secondary)', borderRadius: 4 }}></div>
                <div style={{ width: '95%', height: '11px', background: 'var(--surface-secondary)', borderRadius: 4 }}></div>
              </div>
            </div>
          ))
        ) : emails.length === 0 ? (
          // Empty State
          <div className="detail-empty-state" style={{ paddingTop: '80px' }}>
            <div className="empty-icon-glow">
              <Mail size={32} />
            </div>
            <h4 className="empty-title">No mail here</h4>
            <p className="empty-desc">Folder is empty or no emails matched your search terms.</p>
          </div>
        ) : (
          // Renders emails list
          emails.map((email) => {
            const isChecked = checkedIds.includes(email.id);
            const isSelected = selectedEmailId === email.id;
            const isUnread = !email.read;

            return (
              <div
                key={email.id}
                className={`email-card ${isSelected ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelectEmail(email.id)}
              >
                {/* Left Side check and avatar */}
                <div className="card-left" onClick={(e) => e.stopPropagation()}>
                  <div 
                    className={`checkbox-custom ${isChecked ? 'checked' : ''}`}
                    onClick={(e) => handleToggleCheckOne(email.id, e)}
                  >
                    {isChecked && <Check size={12} />}
                  </div>
                  <div className="avatar">
                    {getInitials(email.from.name)}
                  </div>
                </div>

                {/* Right Side metadata and text */}
                <div className="card-right">
                  <div className="card-row-1">
                    <span className="sender-name">{email.from.name}</span>
                    <span className="email-date">{formatDate(email.date)}</span>
                  </div>
                  
                  <div className="card-row-2">
                    <span className="email-subject">{email.subject}</span>
                    {email.attachments && email.attachments.length > 0 && (
                      <Paperclip size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </div>

                  <p className="email-snippet">{email.snippet}</p>

                  <div className="card-badges">
                    {email.starred && <span className="badge starred">Starred</span>}
                    {email.labelIds.map(label => {
                      if (['INBOX', 'DRAFT', 'SPAM'].includes(label)) {
                        return (
                          <span key={label} className={`badge ${label.toLowerCase()}`}>
                            {label}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Floating Quick Action Buttons on Hover */}
                <div className="card-hover-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="action-icon-btn"
                    onClick={(e) => onToggleStar(email.id, email.starred, e)}
                    title={email.starred ? 'Unstar' : 'Star'}
                  >
                    <Star size={13} fill={email.starred ? 'var(--color-warning)' : 'none'} color={email.starred ? 'var(--color-warning)' : 'currentColor'} />
                  </button>
                  {selectedFolder === 'INBOX' && (
                    <button
                      className="action-icon-btn"
                      onClick={(e) => onArchiveEmail(email.id, e)}
                      title="Archive"
                    >
                      <Archive size={13} />
                    </button>
                  )}
                  <button
                    className="action-icon-btn"
                    onClick={(e) => onMarkRead(email.id, !email.read, e)}
                    title={email.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {email.read ? <Mail size={13} /> : <MailOpen size={13} />}
                  </button>
                  <button
                    className="action-icon-btn"
                    onClick={(e) => onDeleteEmail(email.id, e)}
                    title="Move to Trash"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
