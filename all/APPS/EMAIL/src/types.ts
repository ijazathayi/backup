export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  dataUrl?: string; // used for downloaded attachment simulation or content caching
}

export interface Email {
  id: string;
  threadId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  snippet: string;
  body: string; // The HTML or plain text content
  date: string; // ISO string representation
  labelIds: string[];
  starred: boolean;
  read: boolean;
  attachments?: Attachment[];
}

export interface Folder {
  id: string;
  name: string;
  iconName: string;
  unreadCount: number;
}

export interface UserProfile {
  name: string;
  email: string;
  imageUrl?: string;
}

export interface GmailConfig {
  clientId: string;
  accessToken: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
}
