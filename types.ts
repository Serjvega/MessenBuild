
export type AuthMode = 'login' | 'register';

export interface User {
  id: string;
  username: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  participant: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
}
