"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const rooms_service_1 = require("../rooms/rooms.service");
const vote_dto_1 = require("../common/dtos/vote.dto");
let EventsGateway = class EventsGateway {
    roomsService;
    server;
    logger = new common_1.Logger('EventsGateway');
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    handleConnection(client) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }
    handleJoinRoom(client, data) {
        try {
            const { roomId, username } = data;
            const room = this.roomsService.getRoom(roomId);
            if (!room) {
                client.emit('error', { message: 'Sala no encontrada' });
                return;
            }
            client.join(roomId);
            client.to(roomId).emit('userJoined', { username, roomId });
            client.emit('roomState', room);
            this.logger.log(`Usuario ${username} se unió a la sala ${roomId}`);
        }
        catch (error) {
            this.logger.error('Error al unirse a la sala:', error);
            client.emit('error', { message: 'Error al unirse a la sala' });
        }
    }
    handleVote(client, voteDto) {
        try {
            const { roomId, username, vote } = voteDto;
            const room = this.roomsService.vote(roomId, username, vote);
            this.server.to(roomId).emit('userVoted', {
                username,
                hasVoted: true
            });
            this.logger.log(`Usuario ${username} votó en la sala ${roomId}`);
        }
        catch (error) {
            this.logger.error('Error al registrar voto:', error);
            client.emit('error', { message: 'Error al registrar voto' });
        }
    }
    handleRevealVotes(client, data) {
        try {
            const { roomId } = data;
            const room = this.roomsService.revealVotes(roomId);
            this.server.to(roomId).emit('votesRevealed', {
                users: room.users.map(user => ({
                    username: user.username,
                    vote: user.vote
                })),
                showVotes: room.showVotes
            });
            this.logger.log(`Votos revelados en la sala ${roomId}`);
        }
        catch (error) {
            this.logger.error('Error al revelar votos:', error);
            client.emit('error', { message: 'Error al revelar votos' });
        }
    }
    handleResetVotes(client, data) {
        try {
            const { roomId } = data;
            const room = this.roomsService.resetVotes(roomId);
            this.server.to(roomId).emit('votesReset', { roomId });
            this.logger.log(`Votos reiniciados en la sala ${roomId}`);
        }
        catch (error) {
            this.logger.error('Error al reiniciar votos:', error);
            client.emit('error', { message: 'Error al reiniciar votos' });
        }
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('vote'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        vote_dto_1.VoteDto]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleVote", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('revealVotes'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleRevealVotes", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resetVotes'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleResetVotes", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        namespace: 'poker'
    }),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map