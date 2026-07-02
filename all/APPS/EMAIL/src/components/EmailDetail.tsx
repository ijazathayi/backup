import React, { useRef, useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Archive, 
  Star, 
  CornerUpLeft, 
  Download, 
  Paperclip,
  Loader,
  Send
} from 'lucide-react';
import type { Email } from '../types';

interface EmailDetailProps {
  email: Email | null;
  isLoading: boolean;
  onBackToList: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onSendReply: (to: string, subject: string, replyText: string) => Promise<boolean>;
  isDarkMode: boolean;
  selectedFolder: string;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  isLoading,
  onBackToList,
  onDelete,
  onArchive,
  onToggleStar,
  onSendReply,
  isDarkMode,
  selectedFolder
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Set iframe contents securely using srcDoc
  useEffect(() => {
    if (!email || !iframeRef.current) return;

    // Inject base target="_blank" so all links inside the email open in a new tab.
    // Also, apply background styles matching our theme if the email doesn't specify one, 
    // ensuring dark mode matches dark mode.
    const baseHead = `
      <head>
        <base target="_blank">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};
            background-color: transparent;
            margin: 16px;
            word-wrap: break-word;
          }
          a {
            color: #6366f1;
          }
        </style>
      </head>
    `;

    const docContent = email.body.includes('<html') || email.body.includes('<body')
      ? email.body.replace('<head>', `<head><base target="_blank">`)
      : `<html>${baseHead}<body>${email.body}</body></html>`;

    const iframe = iframeRef.current;
    if (!iframe) return;
    
    // Check if browser supports srcdoc on iframe
    if ('srcdoc' in HTMLIFrameElement.prototype) {
      (iframe as any).srcdoc = docContent;
    } else {
      // Fallback
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(docContent);
        doc.close();
      }
    }

    // Auto-adjust height of iframe based on content size
    const adjustHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          // Add some padding
          iframe.style.height = `${doc.body.scrollHeight + 32}px`;
        }
      } catch (e) {
        // Cross-origin issues could block reading height, set a default
        iframe.style.height = '450px';
      }
    };

    iframe.onload = () => {
      // Small timeout to allow images/styles inside iframe to render
      setTimeout(adjustHeight, 150);
    };

  }, [email, isDarkMode]);

  const handleSendReply = async () => {
    if (!email || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;
      const success = await onSendReply(email.from.email, subject, replyText);
      if (success) {
        setReplyText('');
        alert('Reply sent successfully!');
      } else {
        alert('Failed to send reply. Please try again.');
      }
    } catch (e) {
      alert('An error occurred while sending the reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownloadAttachment = (name: string) => {
    // Simulated download trigger
    alert(`Downloading attachment: ${name} (simulation)`);
  };

  if (isLoading) {
    return (
      <div className="email-detail-panel" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
        <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 14 }}>Loading email content...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="email-detail-panel">
        <div className="detail-empty-state">
          <div className="empty-icon-glow">
            <CornerUpLeft size={32} />
          </div>
          <h4 className="empty-title">Select an email to view</h4>
          <p className="empty-desc">Choose a message from the list pane to display its detailed header details and email body contents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-detail-panel">
      {/* Header Panel */}
      <div className="detail-header">
        <button className="detail-back-btn" onClick={onBackToList}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="detail-actions">
          <button 
            className="action-icon-btn" 
            onClick={() => onToggleStar(email.id, email.starred)}
            title={email.starred ? 'Unstar email' : 'Star email'}
          >
            <Star size={16} fill={email.starred ? 'var(--color-warning)' : 'none'} color={email.starred ? 'var(--color-warning)' : 'currentColor'} />
          </button>

          {selectedFolder === 'INBOX' && (
            <button 
              className="action-icon-btn" 
              onClick={() => onArchive(email.id)}
              title="Archive email"
            >
              <Archive size={16} />
            </button>
          )}

          <button 
            className="action-icon-btn" 
            onClick={() => onDelete(email.id)}
            title="Move to Trash"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Message Reader Area */}
      <div className="detail-scroll-area scrollable-area">
        {/* Subject line */}
        <h1 className="detail-subject-line">{email.subject}</h1>

        {/* Sender details and Date */}
        <div className="detail-meta-row">
          <div className="sender-info">
            <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {email.from.name.charAt(0).toUpperCase()}
            </div>
            <div className="sender-details">
              <span className="sender-email-name">{email.from.name}</span>
              <span className="sender-email-addr">&lt;{email.from.email}&gt;</span>
              <div className="recipient-list">
                to {email.to.map(r => r.name || r.email).join(', ')}
              </div>
            </div>
          </div>

          <div className="detail-date-col">
            <span className="detail-date">
              {new Date(email.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        {/* Email Body Iframe */}
        <div className="email-body-container">
          <iframe 
            ref={iframeRef}
            className="email-iframe"
            title="Email Content Body"
            sandbox="allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="attachments-section">
            <h5 className="attachments-title">
              <Paperclip size={14} />
              Attachments ({email.attachments.length})
            </h5>
            <div className="attachment-grid">
              {email.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="attachment-card"
                  onClick={() => handleDownloadAttachment(attachment.name)}
                >
                  <div className="attachment-info">
                    <Paperclip size={14} style={{ color: 'var(--text-muted)' }} />
                    <div style={{ minWidth: 0 }}>
                      <div className="attachment-name" title={attachment.name}>{attachment.name}</div>
                      <div className="attachment-size">{formatSize(attachment.size)}</div>
                    </div>
                  </div>
                  <button className="action-icon-btn" style={{ padding: 4 }}>
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Inline Reply Box */}
        <div className="quick-reply-box">
          <div className="reply-header">
            Quick Reply to {email.from.name} ({email.from.email})
          </div>
          <textarea
            className="reply-textarea"
            placeholder="Type your message here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={isSendingReply}
          />
          <div className="reply-footer">
            <button 
              className="btn-primary" 
              onClick={handleSendReply} 
              disabled={isSendingReply || !replyText.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {isSendingReply ? <Loader className="animate-spin" size={14} /> : <Send size={14} />}
              Send Reply
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
