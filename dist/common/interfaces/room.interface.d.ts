export interface User {
    id: string;
    username: string;
    vote?: string;
    hasVoted: boolean;
}
export interface Room {
    id: string;
    name: string;
    users: User[];
    showVotes: boolean;
    createdAt: Date;
}
