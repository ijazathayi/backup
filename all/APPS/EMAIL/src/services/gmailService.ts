import type { Email, UserProfile, Attachment } from '../types';

// Default Client ID provided by the user
export const DEFAULT_CLIENT_ID = '61953097945-qovq5k9vqmqgumkem6qm58i3ku8q6jdv.apps.googleusercontent.com';

// Mock Data for Sandbox Mode
const MOCK_PROFILE: UserProfile = {
  name: 'Demo User',
  email: 'demo.user@aeromail.dev',
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
};

const MOCK_EMAILS_INITIAL: Email[] = [
  {
    id: 'mock-1',
    threadId: 'thread-1',
    from: { name: 'Sarah Jenkins', email: 'sarah.j@techcorp.io' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: 'Project Aero Launch Plan & Design Review 🚀',
    snippet: 'Hi team, I have attached the updated roadmap for our Q3 launch. Please review the design changes and let me know your thoughts.',
    body: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">Project Aero Launch Roadmap</h2>
        <p>Hi team,</p>
        <p>I hope you are all having a great week! I have finalized our <strong>Q3 Launch Plan</strong> for Project Aero.</p>
        <p>Here are the primary milestones we need to hit:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Milestone</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Date</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Beta Feedback Review</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">July 1st</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Product</td>
            </tr>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Final Styling Polish</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">July 15th</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Design</td>
            </tr>
            <tr>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">Production Deployment</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">August 1st</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">DevOps</td>
            </tr>
          </tbody>
        </table>
        <p>I have attached the full document detailing the design tweaks and the technical specifications. Please review it by Friday so we can lock in the timeline.</p>
        <p>Best regards,<br/><strong>Sarah Jenkins</strong><br/>Head of Product, TechCorp</p>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    labelIds: ['INBOX', 'UNREAD'],
    starred: true,
    read: false,
    attachments: [
      { id: 'att-1', name: 'Aero_Product_Roadmap_Q3.pdf', size: 1048576, mimeType: 'application/pdf' },
      { id: 'att-2', name: 'design_specs_v2.png', size: 2048576, mimeType: 'image/png' }
    ]
  },
  {
    id: 'mock-2',
    threadId: 'thread-2',
    from: { name: 'Vercel Deployments', email: 'noreply@vercel.com' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: 'Deployment Successful: aero-mail-app-prod',
    snippet: 'Your project aero-mail-app has been deployed successfully to production. Project URL: https://aero-mail.vercel.app',
    body: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; margin-right: 8px;">▲</span>
          <span style="font-size: 18px; font-weight: 600; color: #000;">Vercel</span>
        </div>
        <h3 style="font-size: 20px; font-weight: 600; color: #111; margin-bottom: 8px; margin-top: 0;">Deployment Successful!</h3>
        <p style="font-size: 14px; color: #444; margin-bottom: 24px;">Your project <strong>aero-mail-app</strong> has been deployed to production.</p>
        
        <div style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 5px; padding: 16px; margin-bottom: 24px;">
          <div style="margin-bottom: 8px;"><span style="color: #666; font-size: 12px; display: inline-block; width: 100px;">Project</span><strong style="font-size: 14px; color: #111;">aero-mail-app</strong></div>
          <div style="margin-bottom: 8px;"><span style="color: #666; font-size: 12px; display: inline-block; width: 100px;">Deployment</span><span style="font-family: monospace; font-size: 13px;">aero-mail-app-prod-8f3a</span></div>
          <div style="margin-bottom: 8px;"><span style="color: #666; font-size: 12px; display: inline-block; width: 100px;">Branch</span><span style="background-color: #e3e3e3; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-family: monospace;">main</span></div>
          <div><span style="color: #666; font-size: 12px; display: inline-block; width: 100px;">URL</span><a href="https://aero-mail.vercel.app" style="color: #0070f3; text-decoration: none; font-size: 14px;">https://aero-mail.vercel.app</a></div>
        </div>

        <a href="https://vercel.com/dashboard" style="background-color: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 14px; font-weight: 500; display: inline-block;">View Dashboard</a>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    labelIds: ['INBOX', 'UNREAD'],
    starred: false,
    read: false
  },
  {
    id: 'mock-3',
    threadId: 'thread-3',
    from: { name: 'GitHub Notifications', email: 'notifications@github.com' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: '[GitHub] Security Alert: 3 dependencies require immediate upgrade',
    snippet: 'Dependabot alerted: vulnerabilities found in serialize-javascript, express, and ws packages inside your repository.',
    body: `
      <div style="font-family: sans-serif; color: #24292e; max-width: 600px; margin: 0 auto; border: 1px solid #d1d5da; border-radius: 6px; overflow: hidden;">
        <div style="background-color: #24292e; padding: 16px; color: #fff; display: flex; align-items: center;">
          <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" aria-hidden="true" style="fill: currentColor; margin-right: 12px;"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.41c-2.23.49-2.69-.94-2.69-.94-.36-.92-.88-1.16-.88-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.24 1.9 1.05 2.37.8.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.17c0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
          <span style="font-weight: 600; font-size: 16px;">GitHub Security Alert</span>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; font-weight: bold; color: #cb2431; margin-top: 0;">Potential security vulnerabilities found in your dependencies</p>
          <p style="font-size: 14px; line-height: 1.5;">Dependabot has identified security alerts in your repository <strong>ijazathayi/sample</strong>. Please review these alerts and update your dependency tree.</p>
          
          <div style="border-left: 4px solid #cb2431; padding-left: 12px; margin: 20px 0;">
            <div style="font-weight: 600; font-size: 14px;">serialize-javascript &lt; 6.0.0</div>
            <div style="font-size: 12px; color: #586069;">Severity: <strong>High</strong> | Vulnerable version of serialize-javascript allows Cross-Site Scripting (XSS).</div>
          </div>
          
          <div style="border-left: 4px solid #cb2431; padding-left: 12px; margin: 20px 0;">
            <div style="font-weight: 600; font-size: 14px;">express &lt; 4.19.2</div>
            <div style="font-size: 12px; color: #586069;">Severity: <strong>Moderate</strong> | Denial of Service in express core Router middleware.</div>
          </div>

          <a href="https://github.com" style="background-color: #28a745; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; display: inline-block; margin-top: 10px;">Review Security Alerts</a>
        </div>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    labelIds: ['INBOX'],
    starred: false,
    read: true
  },
  {
    id: 'mock-4',
    threadId: 'thread-4',
    from: { name: 'Stripe Billing', email: 'billing@stripe.com' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: 'Stripe Invoice Paid - #INV-004829',
    snippet: 'Thank you for your payment of $49.00. Your premium subscription to AeroMail has been renewed for another month.',
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 20px auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #635bff; margin: 0; font-size: 28px;">stripe</h2>
        </div>
        <p style="font-size: 15px;">Hi there,</p>
        <p style="font-size: 15px;">Your invoice has been paid. We charged your card ending in <strong>4242</strong> for the amount of <strong>$49.00 USD</strong>.</p>
        
        <div style="border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; padding: 16px 0; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
            <span>Invoice Number</span><strong>#INV-004829</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
            <span>Date</span><strong>June 22, 2026</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <span>Amount Charged</span><strong>$49.00 USD</strong>
          </div>
        </div>
        
        <p style="font-size: 12px; color: #777; text-align: center;">Need to update your payment details? Go to your <a href="https://stripe.com" style="color: #635bff; text-decoration: none;">Billing Portal</a>.</p>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    labelIds: ['INBOX'],
    starred: true,
    read: true
  },
  {
    id: 'mock-5',
    threadId: 'thread-5',
    from: { name: 'Support at Amazon', email: 'auto-confirm@amazon.com' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: 'Your Amazon.com order confirmation #114-9982928-1928392',
    snippet: 'Thank you for shopping with us. We will send a confirmation when your items ship. Expected delivery date: Friday, June 26.',
    body: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 16px; border: 1px solid #ddd;">
        <div style="background-color: #232f3e; padding: 12px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">amazon.com</h2>
        </div>
        <div style="padding: 16px;">
          <h3 style="color: #e47911; margin-top: 0;">Order Confirmation</h3>
          <p>Hi Demo User,</p>
          <p>Thank you for your order. We will send a confirmation email when your order ships.</p>
          
          <div style="background-color: #f6f6f6; padding: 12px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Order Details:</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">1x UltraWide 34-inch Curve Ergonomic Monitor ($329.99)</p>
            <p style="margin: 0; font-size: 14px;">Shipping & Handling: FREE Prime Shipping</p>
          </div>
          
          <p style="font-size: 15px; font-weight: bold;">Expected delivery date: <span style="color: #28a745;">June 26, 2026</span></p>
        </div>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    labelIds: ['INBOX'],
    starred: false,
    read: true
  },
  {
    id: 'mock-6',
    threadId: 'thread-6',
    from: { name: 'Dr. Elizabeth Shaw', email: 'e.shaw@prometheus-labs.org' },
    to: [{ name: 'Demo User', email: 'demo.user@aeromail.dev' }],
    subject: 'Artifact scan analysis results',
    snippet: 'Here is the telemetry from the latest scan on the alien artifact. Carbon dating shows anomalies dating back to 250,000 BCE.',
    body: `
      <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h3>Prometheus Labs - Bio-Chemical Analysis Report</h3>
        <p>Dear Colleague,</p>
        <p>I have processed the latest telemetry files from our scans on the chamber artifact. The chemical breakdown has revealed a complex organic alloy structure.</p>
        <p>Key Findings:</p>
        <ul>
          <li><strong>Age:</strong> Carbon isotope decay lists origin circa 250,000 BCE.</li>
          <li><strong>Structure:</strong> Silicate matrix bound with unknown polymeric compound.</li>
          <li><strong>Energy Signatures:</strong> Intermittent electromagnetic pulses occurring every 12 minutes.</li>
        </ul>
        <p>Please review the telemetry and let me know your thoughts on our expedition setup.</p>
        <p>Sincerely,</p>
        <p><strong>Dr. Elizabeth Shaw</strong><br/>Archaeology & Bio-Science Division</p>
      </div>
    `,
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    labelIds: ['SPAM'],
    starred: false,
    read: true
  }
];

class GmailService {
  private clientId: string = localStorage.getItem('gmail_client_id') || DEFAULT_CLIENT_ID;
  private accessToken: string | null = localStorage.getItem('gmail_access_token');
  private tokenExpiry: number | null = localStorage.getItem('gmail_token_expiry') 
    ? Number(localStorage.getItem('gmail_token_expiry')) 
    : null;
  private tokenClient: any = null;
  private userProfile: UserProfile | null = localStorage.getItem('gmail_user_profile')
    ? JSON.parse(localStorage.getItem('gmail_user_profile')!)
    : null;

  // Local state for Mock Email simulation
  private mockEmails: Email[] = [];

  constructor() {
    this.initMockEmails();
    this.checkGoogleScript();
  }

  private initMockEmails() {
    const saved = localStorage.getItem('mock_emails');
    if (saved) {
      try {
        this.mockEmails = JSON.parse(saved);
      } catch (e) {
        this.mockEmails = [...MOCK_EMAILS_INITIAL];
      }
    } else {
      this.mockEmails = [...MOCK_EMAILS_INITIAL];
      this.saveMockEmails();
    }
  }

  private saveMockEmails() {
    localStorage.setItem('mock_emails', JSON.stringify(this.mockEmails));
  }

  private checkGoogleScript() {
    if (typeof window !== 'undefined') {
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.accounts) {
          this.initTokenClient();
          clearInterval(checkInterval);
        }
      }, 500);
    }
  }

  private initTokenClient() {
    if (!(window as any).google?.accounts?.oauth2) return;

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          console.error('OAuth token client error:', tokenResponse.error);
          return;
        }
        this.accessToken = tokenResponse.access_token;
        this.tokenExpiry = Date.now() + Number(tokenResponse.expires_in) * 1000;
        
        localStorage.setItem('gmail_access_token', this.accessToken!);
        localStorage.setItem('gmail_token_expiry', String(this.tokenExpiry));

        // Fetch user profile info on successful login
        this.fetchProfileInfo().then(() => {
          // Trigger redirect or full reload/state update
          window.location.reload();
        });
      },
    });
  }

  public setClientId(clientId: string) {
    this.clientId = clientId;
    localStorage.setItem('gmail_client_id', clientId);
    this.initTokenClient();
  }

  public getClientId(): string {
    return this.clientId;
  }

  public login(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Google Client is not initialized yet. Verify the client script is loaded and client ID is correct.'));
        return;
      }
      try {
        // Request token directly via GIS popup
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  public logout() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.userProfile = null;
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_token_expiry');
    localStorage.removeItem('gmail_user_profile');
    // Also reset mock emails to clean up sandbox testing
    localStorage.removeItem('mock_emails');
    this.initMockEmails();
    window.location.reload();
  }

  public isLiveMode(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    // Check if token is expired (giving a 5 minute buffer)
    return Date.now() < (this.tokenExpiry - 5 * 60 * 1000);
  }

  public getUserProfile(): UserProfile {
    if (this.isLiveMode() && this.userProfile) {
      return this.userProfile;
    }
    return MOCK_PROFILE;
  }

  private async fetchProfileInfo(): Promise<void> {
    if (!this.accessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.userProfile = {
          name: data.name || 'Gmail User',
          email: data.email,
          imageUrl: data.picture || undefined
        };
        localStorage.setItem('gmail_user_profile', JSON.stringify(this.userProfile));
      }
    } catch (e) {
      console.error('Error fetching user profile from Google:', e);
    }
  }

  // --- Core API Layer ---

  public async getEmails(folder: string = 'INBOX', searchQuery: string = ''): Promise<Email[]> {
    if (this.isLiveMode()) {
      return this.getLiveEmails(folder, searchQuery);
    } else {
      return this.getMockEmails(folder, searchQuery);
    }
  }

  public async getEmailDetail(id: string): Promise<Email | null> {
    if (this.isLiveMode()) {
      return this.getLiveEmailDetail(id);
    } else {
      const email = this.mockEmails.find(e => e.id === id);
      if (email) {
        if (!email.read) {
          email.read = true;
          email.labelIds = email.labelIds.filter(l => l !== 'UNREAD');
          this.saveMockEmails();
        }
        return { ...email };
      }
      return null;
    }
  }

  public async toggleStar(id: string, currentStarred: boolean): Promise<boolean> {
    const targetStatus = !currentStarred;
    if (this.isLiveMode()) {
      return this.modifyLiveEmailLabels(id, targetStatus ? ['STARRED'] : [], targetStatus ? [] : ['STARRED']);
    } else {
      const email = this.mockEmails.find(e => e.id === id);
      if (email) {
        email.starred = targetStatus;
        if (targetStatus) {
          if (!email.labelIds.includes('STARRED')) email.labelIds.push('STARRED');
        } else {
          email.labelIds = email.labelIds.filter(l => l !== 'STARRED');
        }
        this.saveMockEmails();
        return true;
      }
      return false;
    }
  }

  public async markReadStatus(id: string, read: boolean): Promise<boolean> {
    if (this.isLiveMode()) {
      const addLabels = read ? [] : ['UNREAD'];
      const removeLabels = read ? ['UNREAD'] : [];
      return this.modifyLiveEmailLabels(id, addLabels, removeLabels);
    } else {
      const email = this.mockEmails.find(e => e.id === id);
      if (email) {
        email.read = read;
        if (read) {
          email.labelIds = email.labelIds.filter(l => l !== 'UNREAD');
        } else {
          if (!email.labelIds.includes('UNREAD')) email.labelIds.push('UNREAD');
        }
        this.saveMockEmails();
        return true;
      }
      return false;
    }
  }

  public async moveEmailToFolder(id: string, fromFolder: string, toFolder: string): Promise<boolean> {
    if (this.isLiveMode()) {
      const addLabels: string[] = [];
      const removeLabels: string[] = [];

      // Translate folder targets
      if (toFolder === 'TRASH') addLabels.push('TRASH');
      else if (toFolder === 'SPAM') addLabels.push('SPAM');
      else if (toFolder === 'INBOX') addLabels.push('INBOX');

      if (fromFolder === 'TRASH') removeLabels.push('TRASH');
      else if (fromFolder === 'SPAM') removeLabels.push('SPAM');
      else if (fromFolder === 'INBOX') removeLabels.push('INBOX');

      // Specifically, for Gmail, moving to Trash uses Gmail's Trash API or labels. 
      // Gmail's Trash command uses POST /trash, but editing labels (adding 'TRASH' / removing 'INBOX') works too.
      // Let's use the modify labels API or raw trash API. Modify labels is safer.
      return this.modifyLiveEmailLabels(id, addLabels, removeLabels);
    } else {
      const email = this.mockEmails.find(e => e.id === id);
      if (email) {
        // Remove old folder labels
        email.labelIds = email.labelIds.filter(l => l !== fromFolder);
        // Add new folder labels
        if (!email.labelIds.includes(toFolder)) {
          email.labelIds.push(toFolder);
        }
        this.saveMockEmails();
        return true;
      }
      return false;
    }
  }

  public async sendEmail(
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    body: string,
    attachments: { name: string; type: string; base64Data: string }[] = []
  ): Promise<boolean> {
    if (this.isLiveMode()) {
      return this.sendLiveEmail(to, cc, bcc, subject, body, attachments);
    } else {
      // Simulate sending in Mock mode
      const sender = this.getUserProfile();
      const newEmail: Email = {
        id: `mock-sent-${Date.now()}`,
        threadId: `thread-sent-${Date.now()}`,
        from: { name: sender.name, email: sender.email },
        to: to.split(',').map(e => ({ name: e.split('@')[0], email: e.trim() })),
        cc: cc ? cc.split(',').map(e => ({ name: e.split('@')[0], email: e.trim() })) : undefined,
        bcc: bcc ? bcc.split(',').map(e => ({ name: e.split('@')[0], email: e.trim() })) : undefined,
        subject: subject || '(No Subject)',
        snippet: body.substring(0, 100).replace(/<[^>]*>/g, '') + '...',
        body: body,
        date: new Date().toISOString(),
        labelIds: ['SENT'],
        starred: false,
        read: true,
        attachments: attachments.map((a, i) => ({
          id: `att-sent-${i}-${Date.now()}`,
          name: a.name,
          size: Math.round(a.base64Data.length * 0.75), // rough estimation
          mimeType: a.type
        }))
      };

      this.mockEmails.unshift(newEmail);
      this.saveMockEmails();

      // Simulate a lively interactive response!
      // If we send an email to anyone, let's schedule a mock auto-reply 12 seconds later to make the inbox "lively"!
      setTimeout(() => {
        this.simulateIncomingEmail(subject, to);
      }, 12000);

      return true;
    }
  }

  // Helper to simulate incoming emails dynamically (Sandbox mode)
  private simulateIncomingEmail(originalSubject: string, originalRecipient: string) {
    const senderName = 'AeroMail AI Assistant';
    const senderEmail = 'assistant@aeromail.dev';
    
    const replyEmail: Email = {
      id: `mock-in-${Date.now()}`,
      threadId: `thread-in-${Date.now()}`,
      from: { name: senderName, email: senderEmail },
      to: [{ name: 'Demo User', email: MOCK_PROFILE.email }],
      subject: `Re: ${originalSubject}`,
      snippet: `Thanks for testing our interactive mail app! This is a dynamic, automated simulation replying to your email to ${originalRecipient}.`,
      body: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #6366f1; margin-top: 0;">Hello from AeroMail Sandbox!</h3>
          <p>Hi Demo User,</p>
          <p>This is a simulated auto-response confirming that we received your test email sent to <strong>${originalRecipient}</strong>.</p>
          <p>This feature demonstrates the <strong>"lively" real-time syncing</strong> capability of our React client. When you switch to Live Gmail Mode, incoming emails will be fetched instantly using Gmail polling endpoints.</p>
          <p>Feel free to connect your real Google Client ID to unlock actual Gmail sync!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; font-style: italic;">
            Original Subject: ${originalSubject}<br/>
            Delivered: ${new Date().toLocaleTimeString()}
          </p>
        </div>
      `,
      date: new Date().toISOString(),
      labelIds: ['INBOX', 'UNREAD'],
      starred: false,
      read: false
    };

    this.mockEmails.unshift(replyEmail);
    this.saveMockEmails();

    // Dispatch a custom event to notify App.tsx that a new mail has arrived
    window.dispatchEvent(new CustomEvent('aeromail-new-incoming', { detail: replyEmail }));
  }

  // --- Live Gmail API Implementation ---

  private async getLiveEmails(folder: string, searchQuery: string): Promise<Email[]> {
    try {
      // Formulate query parameter matching folders (Gmail Label Names)
      // Inbox = label:INBOX, Sent = label:SENT, Drafts = label:DRAFT, Trash = label:TRASH, Spam = label:SPAM
      let q = '';
      if (folder === 'STARRED') {
        q = 'is:starred';
      } else {
        q = `label:${folder}`;
      }

      if (searchQuery.trim()) {
        q += ` ${searchQuery}`;
      }

      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          this.logout();
        }
        throw new Error(`Failed to list live emails: ${res.statusText}`);
      }

      const data = await res.json();
      const messages = data.messages || [];

      if (messages.length === 0) return [];

      // Fetch message details in parallel
      const detailPromises = messages.map((m: any) => this.getLiveEmailSummary(m.id));
      const results = await Promise.all(detailPromises);
      
      // Filter out null results and sort by date descending
      return results
        .filter((email): email is Email => email !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (err) {
      console.error('Error fetching live emails:', err);
      // Fallback to mock emails silently or throw error
      throw err;
    }
  }

  private async getLiveEmailSummary(id: string): Promise<Email | null> {
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) return null;
      const msg = await res.json();
      return this.parseGmailObject(msg, false);
    } catch (e) {
      return null;
    }
  }

  private async getLiveEmailDetail(id: string): Promise<Email | null> {
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) return null;
      const msg = await res.json();

      const parsed = this.parseGmailObject(msg, true);
      
      // If Gmail message is UNREAD, let's mark it read in the background automatically upon opening
      if (parsed && parsed.labelIds.includes('UNREAD')) {
        this.modifyLiveEmailLabels(id, [], ['UNREAD']);
        parsed.read = true;
        parsed.labelIds = parsed.labelIds.filter(l => l !== 'UNREAD');
      }

      return parsed;
    } catch (e) {
      console.error(`Error loading email detail for ID ${id}:`, e);
      return null;
    }
  }

  private parseGmailObject(msg: any, parseBody: boolean): Email | null {
    const headers = msg.payload?.headers || [];
    
    const getHeader = (name: string): string => {
      const h = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return h ? h.value : '';
    };

    const fromHeader = getHeader('From');
    const toHeader = getHeader('To');
    const subject = getHeader('Subject') || '(No Subject)';
    const dateStr = getHeader('Date');
    
    // Parse sender info
    let from: { name: string; email: string } = { name: 'Unknown Sender', email: '' };
    if (fromHeader) {
      const match = fromHeader.match(/^(.*?)\s*<(.*?)>$/);
      if (match) {
        from = { name: match[1].replace(/"/g, '').trim(), email: match[2].trim() };
      } else {
        from = { name: fromHeader.trim(), email: fromHeader.trim() };
      }
    }

    // Parse recipient list
    const to: { name: string; email: string }[] = [];
    if (toHeader) {
      const addresses = toHeader.split(',');
      for (const addr of addresses) {
        const match = addr.match(/^(.*?)\s*<(.*?)>$/);
        if (match) {
          to.push({ name: match[1].replace(/"/g, '').trim(), email: match[2].trim() });
        } else {
          to.push({ name: addr.trim(), email: addr.trim() });
        }
      }
    }

    const labelIds = msg.labelIds || [];
    const starred = labelIds.includes('STARRED');
    const read = !labelIds.includes('UNREAD');
    
    // Format Date
    let date = new Date().toISOString();
    if (dateStr) {
      try {
        date = new Date(dateStr).toISOString();
      } catch (e) {}
    }

    let body = '';
    const attachments: Attachment[] = [];

    if (parseBody && msg.payload) {
      body = this.extractBody(msg.payload, attachments);
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      from,
      to,
      subject,
      snippet: msg.snippet || '',
      body: body || msg.snippet || '(No Content)',
      date,
      labelIds,
      starred,
      read,
      attachments: attachments.length > 0 ? attachments : undefined
    };
  }

  private extractBody(part: any, attachments: Attachment[]): string {
    let body = '';

    // Handle attachments
    if (part.filename && part.body && part.body.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        name: part.filename,
        size: part.body.size || 0,
        mimeType: part.mimeType
      });
      return '';
    }

    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      body = this.decodeBase64(part.body.data);
      // convert newlines to linebreaks for display
      body = `<div style="white-space: pre-wrap; font-family: monospace;">${this.escapeHtml(body)}</div>`;
    } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
      body = this.decodeBase64(part.body.data);
    } else if (part.parts) {
      // Multipart recursively extract
      let htmlBody = '';
      let textBody = '';
      
      for (const subPart of part.parts) {
        const content = this.extractBody(subPart, attachments);
        if (subPart.mimeType === 'text/html') {
          htmlBody = content;
        } else if (subPart.mimeType === 'text/plain') {
          textBody = content;
        } else if (content) {
          // Fallback if type is not specified or other nested structures
          if (!htmlBody) htmlBody = content;
        }
      }
      body = htmlBody || textBody;
    }

    return body;
  }

  private decodeBase64(data: string): string {
    // Gmail API returns base64url encoded characters
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return decodeURIComponent(escape(window.atob(base64)));
    } catch (e) {
      return window.atob(base64);
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private async modifyLiveEmailLabels(id: string, addLabelIds: string[], removeLabelIds: string[]): Promise<boolean> {
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addLabelIds, removeLabelIds })
      });
      return res.ok;
    } catch (e) {
      console.error(`Failed to modify labels for email ${id}:`, e);
      return false;
    }
  }

  private async sendLiveEmail(
    to: string,
    cc: string,
    bcc: string,
    subject: string,
    body: string,
    attachments: { name: string; type: string; base64Data: string }[]
  ): Promise<boolean> {
    try {
      const boundary = `----AeroMailBoundary_${Date.now()}`;
      
      // Assemble RFC 2822 email format
      let mimeMessage = '';
      mimeMessage += `To: ${to}\r\n`;
      if (cc) mimeMessage += `Cc: ${cc}\r\n`;
      if (bcc) mimeMessage += `Bcc: ${bcc}\r\n`;
      mimeMessage += `Subject: ${subject || '(No Subject)'}\r\n`;
      mimeMessage += `MIME-Version: 1.0\r\n`;
      
      if (attachments.length > 0) {
        mimeMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
        mimeMessage += `--${boundary}\r\n`;
        mimeMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
        mimeMessage += `${body}\r\n\r\n`;
        
        for (const att of attachments) {
          mimeMessage += `--${boundary}\r\n`;
          mimeMessage += `Content-Type: ${att.type}; name="${att.name}"\r\n`;
          mimeMessage += `Content-Disposition: attachment; filename="${att.name}"\r\n`;
          mimeMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;
          mimeMessage += `${att.base64Data}\r\n\r\n`;
        }
        mimeMessage += `--${boundary}--`;
      } else {
        mimeMessage += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
        mimeMessage += `${body}`;
      }

      // Convert to base64url safe encoding
      const base64Safe = window.btoa(unescape(encodeURIComponent(mimeMessage)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64Safe })
      });

      return res.ok;
    } catch (e) {
      console.error('Failed to send live Gmail message:', e);
      return false;
    }
  }

  // Mock-only search helper
  private async getMockEmails(folder: string, searchQuery: string): Promise<Email[]> {
    let filtered = this.mockEmails;
    
    // Filter by Folder labels
    if (folder === 'STARRED') {
      filtered = filtered.filter(e => e.starred);
    } else {
      filtered = filtered.filter(e => e.labelIds.includes(folder));
    }

    // Filter by search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(q) ||
        e.snippet.toLowerCase().includes(q) ||
        e.from.name.toLowerCase().includes(q) ||
        e.from.email.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      );
    }

    // Sort by Date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const gmailService = new GmailService();
