import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '../common/dtos/create-room.dto';
import { JoinRoomDto } from '../common/dtos/join-room.dto';
import { VoteDto } from '../common/dtos/vote.dto';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    createRoom(createRoomDto: CreateRoomDto): import("../common/interfaces/room.interface").Room;
    joinRoom(joinRoomDto: JoinRoomDto): import("../common/interfaces/room.interface").Room;
    vote(voteDto: VoteDto): import("../common/interfaces/room.interface").Room;
    resetVotes(roomId: string): import("../common/interfaces/room.interface").Room;
    revealVotes(roomId: string): import("../common/interfaces/room.interface").Room;
    getRoom(roomId: string): import("../common/interfaces/room.interface").Room;
    removeUser(roomId: string, userId: string): import("../common/interfaces/room.interface").Room;
}
