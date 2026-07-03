import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LogOut, Search, Send, User, Settings as SettingsIcon,
  Edit2, Trash2, X, Info, Paperclip, FileText, Download,
  MoreVertical, Camera, Check, Phone, ChevronRight, MessageSquare
} from 'lucide-react';
import { io } from 'socket.io-client';

/* ─── Avatar Helper ─── */
const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { box: '44px', font: '15px' },
    md: { box: '40px', font: '16px' },
    lg: { box: '90px', font: '32px' },
  };
  const s = sizeMap[size] || sizeMap.md;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const colors = [
    'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
    'linear-gradient(135deg,#3ecf70,#2b8a4e)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#b91c1c)',
    'linear-gradient(135deg,#ec4899,#9d174d)',
  ];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];

  if (src) return (
    <img src={src} alt={name} className={`avatar ${className}`}
      style={{ width: s.box, height: s.box, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  return (
    <div className={className} style={{
      width: s.box, height: s.box, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 600, fontSize: s.font,
      flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)'
    }}>{initials || <User size={parseInt(s.font)} />}</div>
  );
};

/* ─── Toast ─── */
const Toast = ({ message, type }) => (
  <div className={`toast ${type}`}>{message}</div>
);

/* ─── Main Component ─── */
const ChatLayout = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  /* Profile form */
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileAbout, setProfileAbout] = useState(currentUser.about || '');
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(currentUser.avatar || null);
  const [profileSaving, setProfileSaving] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const menuRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Socket setup ── */
  useEffect(() => {
    const s = io(undefined, { withCredentials: true, path: '/socket.io' });

    // Attach presence listeners BEFORE connect fires so the
    // immediate online_users_list reply from server is never missed.
    s.on('online_users_list', (ids) => {
      setOnlineUsers(new Set(ids.map(id => parseInt(id, 10))));
    });
    s.on('user_online', (id) => {
      const uid = parseInt(id, 10);
      setOnlineUsers(prev => { const n = new Set(prev); n.add(uid); return n; });
    });
    s.on('user_offline', (id) => {
      const uid = parseInt(id, 10);
      setOnlineUsers(prev => { const n = new Set(prev); n.delete(uid); return n; });
    });

    s.on('connect', () => {
      // Server will immediately reply with online_users_list after register
      s.emit('register', currentUser.id);
    });

    setSocket(s);
    return () => s.close();
  }, [currentUser.id]);

  /* ── Socket listeners (messages only) ── */
  useEffect(() => {
    if (!socket) return;

    const onReceive = (message) => {
      setMessages(prev => {
        if (
          message.sender_id === currentUser.id ||
          (selectedUser && (message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id))
        ) {
          if (!prev.find(m => m.id === message.id)) return [...prev, message];
        }
        return prev;
      });
    };

    const onUpdated = (data) =>
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));

    socket.on('receive_message', onReceive);
    socket.on('message_updated', onUpdated);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('message_updated', onUpdated);
    };
  }, [socket, selectedUser, currentUser.id]);

  /* ── Fetch users ── */
  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) { setUsers(d); setFilteredUsers(d); } })
      .catch(console.error);
  }, []);

  /* ── Search filter ── */
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredUsers(users); return; }
    setFilteredUsers(users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, users]);

  /* ── Fetch messages ── */
  useEffect(() => {
    if (!selectedUser) return;
    setShowContactInfo(false); setEditingMessage(null); setNewMessage(''); setOpenMenuId(null);
    fetch(`/api/messages/${selectedUser.id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setMessages(d); })
      .catch(console.error);
  }, [selectedUser]);

  /* ── Auto scroll ── */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ── Close menu on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Send message ── */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;
    if (editingMessage) {
      socket.emit('edit_message', { message_id: editingMessage.id, new_text: newMessage });
      setEditingMessage(null);
    } else {
      socket.emit('send_message', {
        sender_id: currentUser.id, receiver_id: selectedUser.id, text: newMessage
      });
    }
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
  };

  /* ── File upload ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser || !socket) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await fetch('/api/messages/upload', {
        method: 'POST', body: formData, credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        socket.emit('send_message', {
          sender_id: currentUser.id, receiver_id: selectedUser.id,
          text: file.name, attachment_url: data.url, attachment_type: data.type
        });
      }
    } catch (err) { showToast('Upload failed', 'error'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  /* ── Avatar file pick ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileAvatarFile(file);
    setProfileAvatarPreview(URL.createObjectURL(file));
  };

  /* ── Profile update ── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    const formData = new FormData();
    formData.append('name', profileName);
    formData.append('about', profileAbout);
    if (profileAvatarFile) formData.append('avatar', profileAvatarFile);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT', body: formData, credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Profile updated!', 'success');
        setShowSettings(false);
        setProfileAvatarFile(null);
        // Update local saved accounts
        const saved = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
        const updated = saved.map(a => a.phone_number === currentUser.phone_number
          ? { ...a, name: data.name, avatar: data.avatar }
          : a
        );
        localStorage.setItem('savedAccounts', JSON.stringify(updated));
      } else {
        showToast(data.error || 'Update failed', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setProfileSaving(false); }
  };

  /* ── Message actions ── */
  const startEditing = (msg) => {
    setEditingMessage(msg); setNewMessage(msg.text); setOpenMenuId(null);
  };
  const deleteMessage = (msgId) => {
    if (socket) socket.emit('delete_message', { message_id: msgId });
    setOpenMenuId(null);
  };

  const isOnline = (id) => onlineUsers.has(id);

  /* ── Render message content ── */
  const renderMsgContent = (msg) => {
    if (msg.is_deleted) return <span style={{ opacity: 0.6, fontStyle: 'italic' }}>{msg.text}</span>;
    if (msg.attachment_url) {
      const t = msg.attachment_type || '';
      if (t.startsWith('image/')) return (
        <img src={msg.attachment_url} alt="Attachment" className="attachment-image"
          onClick={() => window.open(msg.attachment_url, '_blank')} />
      );
      if (t.startsWith('audio/')) return (
        <audio controls src={msg.attachment_url} className="attachment-audio" />
      );
      return (
        <div className="attachment-doc">
          <FileText size={22} />
          <span className="attachment-doc-name">{msg.text}</span>
          <a href={msg.attachment_url} download target="_blank" rel="noopener noreferrer" className="attachment-doc-dl">
            <Download size={16} />
          </a>
        </div>
      );
    }
    return <span>{msg.text}</span>;
  };

  /* ══════════════════════════════════════════════
      RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="app-layout glass-panel">

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="user-profile" onClick={() => { setShowSettings(true); setSelectedUser(null); }}>
            <div style={{ position: 'relative' }}>
              <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
              {isOnline(currentUser.id) && <div className="online-dot" />}
            </div>
            <div>
              <div className="user-name">{currentUser.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>My Profile</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="icon-btn" onClick={() => { setShowSettings(true); setSelectedUser(null); }} title="Settings">
              <SettingsIcon size={18} />
            </button>
            <button className="icon-btn" onClick={onLogout} title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <div className="search-input-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text" placeholder="Search contacts..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="contact-list">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className={`contact-item ${selectedUser?.id === user.id && !showSettings ? 'active' : ''}`}
              onClick={() => { setSelectedUser(user); setShowSettings(false); }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar src={user.avatar} name={user.name} size="sm" />
                {isOnline(user.id) && <div className="online-dot" />}
              </div>
              <div className="contact-info">
                <div className="contact-name">{user.name}</div>
                <div className={`contact-status ${isOnline(user.id) ? 'online' : ''}`}>
                  {isOnline(user.id) ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="chat-area">

        {/* Settings modal */}
        {showSettings && (
          <div className="settings-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
            <div className="settings-modal">
              <div className="settings-modal-header">
                <h2>Edit Profile</h2>
                <button className="icon-btn" onClick={() => setShowSettings(false)}><X size={18} /></button>
              </div>
              <div className="settings-modal-body">
                <form onSubmit={handleUpdateProfile}>

                  {/* Avatar upload widget */}
                  <div className="avatar-upload-widget">
                    <div className="avatar-upload-circle" onClick={() => avatarInputRef.current?.click()}>
                      {profileAvatarPreview ? (
                        <img src={profileAvatarPreview} alt="Preview"
                          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)', display: 'block' }} />
                      ) : (
                        <div style={{
                          width: '90px', height: '90px', borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '32px',
                          fontWeight: 600, color: 'white', border: '3px solid var(--border-color)',
                          background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)'
                        }}>
                          {profileName.charAt(0).toUpperCase() || <User size={32} />}
                        </div>
                      )}
                      <div className="avatar-upload-overlay">
                        <Camera size={20} color="white" />
                        <span>Change</span>
                      </div>
                    </div>
                    <input type="file" accept="image/*" ref={avatarInputRef}
                      style={{ display: 'none' }} onChange={handleAvatarChange} />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to change profile picture</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" type="text" value={profileName}
                      onChange={e => setProfileName(e.target.value)} placeholder="Enter your name" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">About / Status</label>
                    <input className="form-input" type="text" value={profileAbout}
                      onChange={e => setProfileAbout(e.target.value)} placeholder="e.g. Available, Busy, In a meeting..." />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : <><Check size={15} /> Save Changes</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat or empty state */}
        {!selectedUser ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">
              <MessageSquare size={38} color="var(--accent-color)" />
            </div>
            <h3>Start a Conversation</h3>
            <p>Select a contact from the left to begin chatting</p>
          </div>
        ) : (
          <>
            {/* ── Chat header ── */}
            <div className="chat-header">
              <div className="chat-header-info" onClick={() => setShowContactInfo(!showContactInfo)}>
                <div style={{ position: 'relative' }}>
                  <Avatar src={selectedUser.avatar} name={selectedUser.name} size="md" />
                  {isOnline(selectedUser.id) && <div className="online-dot" />}
                </div>
                <div>
                  <div className="chat-user-name">{selectedUser.name}</div>
                  <div className={`chat-status ${isOnline(selectedUser.id) ? 'online' : ''}`}>
                    {isOnline(selectedUser.id) ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="icon-btn" onClick={() => setShowContactInfo(!showContactInfo)} title="Contact Info">
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* ── Message + Info Row ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* Messages */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="messages-container">
                  {messages.map((msg, index) => {
                    const isSent = msg.sender_id === currentUser.id;
                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const timeDiff = Date.now() - new Date(msg.created_at).getTime();
                    const canEdit = isSent && timeDiff < 5 * 60 * 1000 && !msg.is_deleted;
                    const menuOpen = openMenuId === msg.id;

                    return (
                      <div key={msg.id || index} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>

                        {/* three-dot action */}
                        {isSent && !msg.is_deleted && (
                          <div className="message-action-area" ref={menuOpen ? menuRef : null}>
                            <button className="msg-dots-btn" onClick={() => setOpenMenuId(menuOpen ? null : msg.id)}>
                              <MoreVertical size={15} />
                            </button>
                            {menuOpen && (
                              <div className="msg-dropdown">
                                {canEdit && (
                                  <button className="msg-dropdown-item" onClick={() => startEditing(msg)}>
                                    <Edit2 size={14} /> Edit
                                  </button>
                                )}
                                <button className="msg-dropdown-item danger" onClick={() => deleteMessage(msg.id)}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`message ${isSent ? 'sent' : 'received'} ${msg.is_deleted ? 'deleted' : ''}`}>
                          {renderMsgContent(msg)}
                          <span className="message-time">
                            {time}
                            {msg.is_edited && !msg.is_deleted && <span className="message-edited"> · edited</span>}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                  {editingMessage && (
                    <div className="edit-banner">
                      <span>Editing message</span>
                      <button style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                        onClick={() => { setEditingMessage(null); setNewMessage(''); }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="input-container">
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                    <button className="icon-btn" onClick={() => fileInputRef.current?.click()} disabled={isUploading} title="Attach File">
                      <Paperclip size={18} color={isUploading ? 'var(--text-muted)' : 'var(--text-secondary)'} />
                    </button>
                    <textarea
                      className="chat-input"
                      placeholder={editingMessage ? 'Edit your message...' : 'Type a message...'}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button className="send-btn" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Contact Info Panel ── */}
              {showContactInfo && (
                <div className="contact-info-panel">
                  <Avatar src={selectedUser.avatar} name={selectedUser.name} size="lg" />
                  <h3>{selectedUser.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: isOnline(selectedUser.id) ? 'var(--green-online)' : 'var(--text-muted)',
                    }} />
                    <span className="contact-info-meta"
                      style={{ color: isOnline(selectedUser.id) ? 'var(--green-online)' : 'var(--text-muted)' }}>
                      {isOnline(selectedUser.id) ? 'Online now' : 'Offline'}
                    </span>
                  </div>

                  {selectedUser.phone_number && (
                    <div className="info-card" style={{ marginTop: '16px' }}>
                      <div className="info-card-label">Phone</div>
                      <div className="info-card-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        {selectedUser.phone_number}
                      </div>
                    </div>
                  )}

                  <div className="info-card" style={{ marginTop: '10px' }}>
                    <div className="info-card-label">About</div>
                    <div className="info-card-value">{selectedUser.about || 'Available'}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ChatLayout;
