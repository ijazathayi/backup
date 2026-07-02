import React, { useState } from 'react';
import { X, Key, Info, Check, LogOut } from 'lucide-react';
import { gmailService } from '../services/gmailService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveMode: boolean;
  userEmail?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isLiveMode,
  userEmail
}) => {
  const [clientIdInput, setClientIdInput] = useState(gmailService.getClientId());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    gmailService.setClientId(clientIdInput.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect your Google Account? This will clear all access credentials.')) {
      gmailService.logout();
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Key className="logo-icon" style={{ width: 18, height: 18 }} />
            Application Settings
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Connection Status Section */}
          <div className="settings-section">
            <h4 className="settings-section-title">Integration Status</h4>
            <div className="connection-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="status-indicator">
                  <span className={`status-dot ${isLiveMode ? 'connected' : 'sandbox'}`}></span>
                  <span className="status-label">
                    {isLiveMode ? 'Connected to Google' : 'Sandbox (Demo Mode)'}
                  </span>
                </div>
                <p className="status-desc" style={{ maxWidth: '350px' }}>
                  {isLiveMode
                    ? `Actively syncing with Gmail inbox: ${userEmail || 'Authenticating...'}`
                    : 'Running in simulation mode with demo content. Connect your Client ID to access real emails.'}
                </p>
              </div>
              {isLiveMode && (
                <button
                  onClick={handleDisconnect}
                  className="footer-btn"
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', flex: 'none', padding: '8px 12px' }}
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              )}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

          {/* Client ID Configuration Form */}
          <form onSubmit={handleSave} className="settings-section">
            <h4 className="settings-section-title">Google OAuth 2.0 Client Credentials</h4>
            
            <label className="input-label" htmlFor="clientId">Google OAuth Client ID</label>
            <input
              id="clientId"
              type="text"
              className="input-field"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="Enter your Client ID here"
              disabled={isLiveMode}
            />
            
            <p className="settings-desc">
              To fetch live Gmail messages, our client-side application utilizes your custom Google Client ID. This ensures your tokens remain strictly local in your browser storage.
            </p>

            {!isLiveMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saveSuccess ? <Check size={15} /> : null}
                  {saveSuccess ? 'Client ID Saved!' : 'Save Client ID'}
                </button>
              </div>
            )}
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

          {/* Documentation Helper */}
          <div className="settings-section">
            <h4 className="settings-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} style={{ color: 'var(--color-primary)' }} />
              How to get a free Google Client ID?
            </h4>
            <ol className="steps-list">
              <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Google Cloud Console</a>.</li>
              <li>Create a new project (e.g. "AeroMail App").</li>
              <li>Search for **Gmail API** in the API library and click **Enable**.</li>
              <li>Go to the **OAuth consent screen** tab, configure the user type as **External**, configure app names, and add your email under developer contacts.</li>
              <li>Add the scopes: <code style={{ backgroundColor: 'var(--surface-tertiary)', padding: '2px 4px', borderRadius: 4, fontSize: 11 }}>gmail.readonly</code>, <code style={{ backgroundColor: 'var(--surface-tertiary)', padding: '2px 4px', borderRadius: 4, fontSize: 11 }}>gmail.modify</code>, and <code style={{ backgroundColor: 'var(--surface-tertiary)', padding: '2px 4px', borderRadius: 4, fontSize: 11 }}>gmail.send</code>.</li>
              <li>Add your email address in the **Test users** panel (crucial to bypass Google approval).</li>
              <li>Go to **Credentials** tab, click **Create Credentials** &rarr; **OAuth client ID**.</li>
              <li>Select application type **Web application**.</li>
              <li>Add Authorized JavaScript origins: <code style={{ backgroundColor: 'var(--surface-tertiary)', padding: '2px 4px', borderRadius: 4, fontSize: 11 }}>http://localhost:5173</code> (or your current dev server URL).</li>
              <li>Click **Create**, copy the generated **Client ID**, and paste it into the field above!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
