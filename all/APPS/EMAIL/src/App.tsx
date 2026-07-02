import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { ComposeModal } from './components/ComposeModal';
import { SettingsModal } from './components/SettingsModal';
import { gmailService } from './services/gmailService';
import type { Email } from './types';

function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_dark');
    return saved !== null ? JSON.parse(saved) : true; // Dark mode by default
  });

  // Global Config / Auth State
  const isLiveMode = gmailService.isLiveMode();
  const userProfile = gmailService.getUserProfile();

  // Email State
  const [currentFolder, setCurrentFolder] = useState<string>('INBOX');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  // Loading States
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  
  // Modal States
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Stats State
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});


  // Apply dark mode styling to document html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
    }
    localStorage.setItem('theme_dark', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Load email lists
  const loadEmails = useCallback(async (background = false) => {
    if (!background) setIsLoadingEmails(true);
    try {
      const list = await gmailService.getEmails(currentFolder, searchQuery);
      setEmails(list);

      // Re-fetch detail in case selected email details changed (e.g. read status)
      if (selectedEmailId) {
        const found = list.find(e => e.id === selectedEmailId);
        // If found, update read status on detail view or reload detail
        if (found && selectedEmail && found.read !== selectedEmail.read) {
          setSelectedEmail(found);
        }
      }
    } catch (e) {
      console.error('Error fetching emails list:', e);
    } finally {
      if (!background) setIsLoadingEmails(false);
    }
  }, [currentFolder, searchQuery, selectedEmailId, selectedEmail]);

  // Calculate folder stats/unread counts
  const loadUnreadCounts = useCallback(async () => {
    try {
      const counts: { [key: string]: number } = {};
      const foldersToCheck = ['INBOX', 'DRAFT', 'SPAM', 'STARRED'];
      
      for (const folder of foldersToCheck) {
        const folderMails = await gmailService.getEmails(folder, '');
        if (folder === 'STARRED') {
          // for starred, count all starred
          counts[folder] = folderMails.length;
        } else {
          // count unread
          counts[folder] = folderMails.filter(e => !e.read).length;
        }
      }
      setUnreadCounts(counts);
    } catch (e) {
      console.error('Error loading unread counts:', e);
    }
  }, []);

  // Sync emails when conditions change
  useEffect(() => {
    loadEmails();
    loadUnreadCounts();
  }, [currentFolder, searchQuery, loadEmails, loadUnreadCounts]);

  // Lively polling/sync interval (polls every 20 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch in background silently
      loadEmails(true);
      loadUnreadCounts();
    }, 20000);

    return () => clearInterval(interval);
  }, [loadEmails, loadUnreadCounts]);

  // Catch dynamic Sandbox responses to trigger lively notifications
  useEffect(() => {
    const handleIncomingMock = (event: Event) => {
      const newMail = (event as CustomEvent).detail as Email;
      
      // If we are currently looking at the inbox folder, prepended email
      if (currentFolder === 'INBOX') {
        setEmails(prev => [newMail, ...prev]);
      }
      
      // Update unread stats
      setUnreadCounts(prev => ({
        ...prev,
        INBOX: (prev.INBOX || 0) + 1
      }));

      // Gentle browser page notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`MyMail: ${newMail.from.name}`, {
          body: newMail.subject,
        });
      }
    };

    window.addEventListener('aeromail-new-incoming', handleIncomingMock);
    return () => window.removeEventListener('aeromail-new-incoming', handleIncomingMock);
  }, [currentFolder]);

  // Register Notification permissions on startup
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch full email details
  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);
    setIsLoadingDetail(true);
    try {
      const detail = await gmailService.getEmailDetail(id);
      setSelectedEmail(detail);
      
      // Since clicking marks read, update counts
      loadUnreadCounts();
      
      // Also update the list item read status locally without full fetch
      setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
    } catch (e) {
      console.error('Error loading email details:', e);
      setSelectedEmail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Actions: Toggle Star
  const handleToggleStar = async (id: string, currentStarred: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await gmailService.toggleStar(id, currentStarred);
    if (success) {
      // Toggle local list states
      setEmails(prev => prev.map(email => 
        email.id === id ? { ...email, starred: !currentStarred } : email
      ));
      // Toggle detail view if currently open
      if (selectedEmail && selectedEmail.id === id) {
        setSelectedEmail(prev => prev ? { ...prev, starred: !currentStarred } : null);
      }
      loadUnreadCounts();
    }
  };

  // Actions: Move to Trash (Delete)
  const handleDeleteEmail = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // In Gmail, if we are in TRASH, this deletes permanently, otherwise moves to TRASH.
    // In our app, we move from currentFolder to TRASH.
    const targetFolder = currentFolder === 'TRASH' ? 'DELETE_FOREVER' : 'TRASH';
    
    if (targetFolder === 'DELETE_FOREVER') {
      if (!window.confirm('Delete this email permanently? This action cannot be undone.')) {
        return;
      }
    }

    const success = await gmailService.moveEmailToFolder(id, currentFolder, 'TRASH');
    if (success) {
      // Remove from active email list
      setEmails(prev => prev.filter(email => email.id !== id));
      
      // Deselect detail view if it was this email
      if (selectedEmailId === id) {
        setSelectedEmailId(null);
        setSelectedEmail(null);
      }
      loadUnreadCounts();
    }
  };

  // Actions: Archive
  const handleArchiveEmail = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Archiving means removing from INBOX label
    const success = await gmailService.moveEmailToFolder(id, 'INBOX', 'ARCHIVE');
    if (success) {
      setEmails(prev => prev.filter(email => email.id !== id));
      if (selectedEmailId === id) {
        setSelectedEmailId(null);
        setSelectedEmail(null);
      }
      loadUnreadCounts();
    }
  };

  // Actions: Mark Read/Unread
  const handleMarkRead = async (id: string, read: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await gmailService.markReadStatus(id, read);
    if (success) {
      setEmails(prev => prev.map(email => 
        email.id === id ? { ...email, read } : email
      ));
      if (selectedEmail && selectedEmail.id === id) {
        setSelectedEmail(prev => prev ? { ...prev, read } : null);
      }
      loadUnreadCounts();
    }
  };

  // Actions: Send New Email
  const handleSendEmail = async (
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    body: string,
    attachments: { name: string; type: string; base64Data: string }[]
  ): Promise<boolean> => {
    const success = await gmailService.sendEmail(to, cc, bcc, subject, body, attachments);
    if (success) {
      loadEmails();
      loadUnreadCounts();
      return true;
    }
    return false;
  };

  // Actions: Reply Inline Send
  const handleSendReply = async (to: string, subject: string, replyText: string): Promise<boolean> => {
    // Formulate a beautiful reply body string
    const htmlReply = `
      <div>
        <p>${replyText.replace(/\n/g, '<br/>')}</p>
        <br/>
        <div style="border-left: 2px solid #6366f1; padding-left: 12px; margin-left: 4px; color: #6b7280;">
          <p>On ${new Date(selectedEmail?.date || '').toLocaleString()}, <strong>${selectedEmail?.from.name}</strong> wrote:</p>
          <div>${selectedEmail?.body}</div>
        </div>
      </div>
    `;

    const success = await gmailService.sendEmail(to, '', '', subject, htmlReply);
    if (success) {
      loadEmails();
      loadUnreadCounts();
      return true;
    }
    return false;
  };

  const handleSelectFolder = (folderId: string) => {
    setCurrentFolder(folderId);
    // Clear active email selections
    setSelectedEmailId(null);
    setSelectedEmail(null);
  };

  const handleConnectGmail = async () => {
    try {
      await gmailService.login();
    } catch (err: any) {
      alert(err.message || 'Failed to authenticate with Google. Verify your Client ID is valid.');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Component */}
      <Sidebar
        currentFolder={currentFolder}
        onSelectFolder={handleSelectFolder}
        onOpenCompose={() => setIsComposeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLiveMode={isLiveMode}
        userProfile={userProfile}
        unreadCounts={unreadCounts}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Mail Grid Area */}
      <div className={`main-content ${selectedEmailId ? 'detail-open' : ''}`}>
        
        {/* Email Listing Panel */}
        <EmailList
          emails={emails}
          isLoading={isLoadingEmails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={handleSelectEmail}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadEmails()}
          onToggleStar={(id, starred, e) => handleToggleStar(id, starred, e)}
          onDeleteEmail={(id, e) => handleDeleteEmail(id, e)}
          onArchiveEmail={(id, e) => handleArchiveEmail(id, e)}
          onMarkRead={(id, read, e) => handleMarkRead(id, read, e)}
          selectedFolder={currentFolder}
          isLiveMode={isLiveMode}
          onConnectGmail={handleConnectGmail}
        />

        {/* Email Detail Panel */}
        <EmailDetail
          email={selectedEmail}
          isLoading={isLoadingDetail}
          onBackToList={() => { setSelectedEmailId(null); setSelectedEmail(null); }}
          onDelete={(id) => handleDeleteEmail(id)}
          onArchive={(id) => handleArchiveEmail(id)}
          onToggleStar={(id, starred) => handleToggleStar(id, starred)}
          onSendReply={handleSendReply}
          isDarkMode={isDarkMode}
          selectedFolder={currentFolder}
        />

      </div>

      {/* Floating Compose Message Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
      />

      {/* Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isLiveMode={isLiveMode}
        userEmail={userProfile.email}
      />
    </div>
  );
}

export default App;
