import { Room } from '../common/interfaces/room.interface';
export declare class RoomsService {
    private rooms;
    createRoom(name: string, username: string): Room;
    joinRoom(roomId: string, username: string): Room;
    vote(roomId: string, userId: string, vote: string): Room;
    resetVotes(roomId: string): Room;
    revealVotes(roomId: string): Room;
    getRoom(roomId: string): Room;
    removeUser(roomId: string, userId: string): Room;
}
