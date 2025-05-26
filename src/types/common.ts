import { Socket } from 'socket.io';

export interface User {
  id: string;
  username: string;
  voted?: boolean;
  vote?: string | null;
  color?: string;
}

export interface Room {
  users: Map<string, User>;
  votes: Map<string, string>;
  showVotes: boolean;
}

export interface Document {
  content: string;
  users: Map<string, User>;
  cursorPositions: Map<string, CursorPosition>;
}

export interface CursorPosition {
  row: number;
  column: number;
  username: string;
  color: string;
}

export interface CustomSocket extends Socket {
  type?: 'planning' | 'editor';
  username?: string;
  roomId?: string;
  documentId?: string;
}

export interface ServerToClientEvents {
  // Planning Poker Events
  'room_update': (data: {
    users: User[];
    votes: Record<string, string>;
    showVotes: boolean;
  }) => void;
  
  'vote_received': (data: {
    username: string;
    allVoted: boolean;
    votes: Record<string, string>;
  }) => void;
  
  'votes_visibility': (data: {
    showVotes: boolean;
    votes: Record<string, string>;
  }) => void;
  
  'votes_reset': (data: {
    users: User[];
    votes: Record<string, string>;
    showVotes: boolean;
  }) => void;
  
  'user_left': (data: {
    username: string;
    users: User[];
    votes: Record<string, string>;
  }) => void;
  
  // Text Editor Events
  'document_state': (data: {
    content: string;
    users: User[];
    cursorPositions: Record<string, CursorPosition>;
  }) => void;
  
  'user_joined': (data: {
    user: User;
  }) => void;
  
  'content_updated': (data: {
    content: string;
  }) => void;
  
  'cursor_moved': (data: {
    userId: string;
    position: CursorPosition;
  }) => void;
}

export interface ClientToServerEvents {
  // Planning Poker Events
  'join_room': (data: { roomId: string; username: string }, callback?: () => void) => void;
  'submit_vote': (data: { roomId: string; vote: string }) => void;
  'toggle_votes': (data: { roomId: string; show: boolean }) => void;
  'reset_votes': (roomId: string) => void;
  
  // Text Editor Events
  'join_document': (data: { documentId: string; username: string }, callback?: () => void) => void;
  'content_change': (data: { documentId: string; content: string }) => void;
  'cursor_move': (data: { documentId: string; position: Omit<CursorPosition, 'username' | 'color'> }) => void;
}

export interface InterServerEvents {
  // Puedes añadir eventos entre servidores si es necesario
}

export interface SocketData {
  username?: string;
  roomId?: string;
  documentId?: string;
}
