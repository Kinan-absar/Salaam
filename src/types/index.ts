export enum HelpCategory {
  MONEY = 'money',
  GOODS = 'goods',
  SKILLS = 'skills',
  OTHER = 'other'
}

export enum RequestStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  avatar?: string;
  joinedAt: string;
}

export interface HelpRequest {
  id: string;
  authorUid: string;
  anonymous: boolean;
  title: string;
  body: string;
  category: HelpCategory;
  status: RequestStatus;
  createdAt: string;
  urgent: boolean;
}

export interface HelpOffer {
  id: string;
  requestId: string;
  volunteerUid: string;
  message: string;
  type: HelpCategory;
  createdAt: string;
}

export interface Notification {
  id: string;
  uid: string;
  type: 'new_offer' | 'request_resolved' | 'general';
  data: any;
  read: boolean;
  createdAt: string;
}
