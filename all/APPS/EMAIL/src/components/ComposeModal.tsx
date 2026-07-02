import React, { useState, useRef } from 'react';
import { X, Send, Paperclip, ChevronDown, ChevronUp, Loader } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    body: string,
    attachments: { name: string; type: string; base64Data: string }[]
  ) => Promise<boolean>;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSend
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; base64Data: string }[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        // extract raw base64 data
        const resultString = reader.result as string;
        const base64Data = resultString.split(',')[1] || '';
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          base64Data
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      alert('Please specify at least one recipient in the "To" field.');
      return;
    }

    setIsSending(true);
    try {
      // In web mail, body can be wrapped in plain formatting or HTML.
      // We will wrap paragraphs in basic HTML tags for Gmail rendering compatibility.
      const formattedBody = body.replace(/\n/g, '<br/>');
      const success = await onSend(to, cc, bcc, subject, formattedBody, attachments);

      if (success) {
        // Reset states
        setTo('');
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
        setAttachments([]);
        onClose();
      } else {
        alert('Failed to send email. Please check your credentials or network and try again.');
      }
    } catch (err) {
      alert('Error sending email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`modal-overlay compose-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-container compose-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header" style={{ padding: '14px 20px' }}>
          <h3 className="modal-title">New Message</h3>
          <button className="modal-close-btn" onClick={onClose} disabled={isSending}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="modal-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* To field */}
            <div className="form-group-row">
              <span className="form-group-label">To</span>
              <input
                type="text"
                className="form-group-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipients@example.com"
                required
                disabled={isSending}
              />
              <button 
                type="button" 
                style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                onClick={() => setShowCcBcc(!showCcBcc)}
              >
                Cc/Bcc {showCcBcc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Cc / Bcc fields (collapsible) */}
            {showCcBcc && (
              <>
                <div className="form-group-row">
                  <span className="form-group-label">Cc</span>
                  <input
                    type="text"
                    className="form-group-input"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="cc@example.com"
                    disabled={isSending}
                  />
                </div>
                <div className="form-group-row">
                  <span className="form-group-label">Bcc</span>
                  <input
                    type="text"
                    className="form-group-input"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    disabled={isSending}
                  />
                </div>
              </>
            )}

            {/* Subject field */}
            <div className="form-group-row">
              <span className="form-group-label">Subject</span>
              <input
                type="text"
                className="form-group-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                disabled={isSending}
              />
            </div>

            {/* Body Editor Textarea */}
            <textarea
              className="form-body-textarea scrollable-area"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email details here..."
              disabled={isSending}
            />

            {/* Attachments listing */}
            {attachments.length > 0 && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Attached Files:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {attachments.map((att, idx) => (
                    <div 
                      key={idx} 
                      style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Paperclip size={12} />
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.name}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttachment(idx)}
                        style={{ color: 'var(--color-danger)', cursor: 'pointer', padding: 2 }}
                        disabled={isSending}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
          </div>

          {/* Footer controls */}
          <div className="modal-footer" style={{ padding: '12px 20px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleTriggerFileSelect}
              disabled={isSending}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Paperclip size={14} />
              Attach Files
            </button>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSending}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {isSending ? <Loader className="animate-spin" size={14} /> : <Send size={14} />}
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
