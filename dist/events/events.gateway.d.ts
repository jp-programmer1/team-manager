import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { VoteDto } from '../common/dtos/vote.dto';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly roomsService;
    server: Server;
    private logger;
    constructor(roomsService: RoomsService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
        username: string;
    }): void;
    handleVote(client: Socket, voteDto: VoteDto): void;
    handleRevealVotes(client: Socket, data: {
        roomId: string;
    }): void;
    handleResetVotes(client: Socket, data: {
        roomId: string;
    }): void;
}
