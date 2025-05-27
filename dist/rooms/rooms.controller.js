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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_service_1 = require("./rooms.service");
const create_room_dto_1 = require("../common/dtos/create-room.dto");
const join_room_dto_1 = require("../common/dtos/join-room.dto");
const vote_dto_1 = require("../common/dtos/vote.dto");
let RoomsController = class RoomsController {
    roomsService;
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    createRoom(createRoomDto) {
        return this.roomsService.createRoom(createRoomDto.name, createRoomDto.username);
    }
    joinRoom(joinRoomDto) {
        return this.roomsService.joinRoom(joinRoomDto.roomId, joinRoomDto.username);
    }
    vote(voteDto) {
        return this.roomsService.vote(voteDto.roomId, voteDto.username, voteDto.vote);
    }
    resetVotes(roomId) {
        return this.roomsService.resetVotes(roomId);
    }
    revealVotes(roomId) {
        return this.roomsService.revealVotes(roomId);
    }
    getRoom(roomId) {
        const room = this.roomsService.getRoom(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        return room;
    }
    removeUser(roomId, userId) {
        return this.roomsService.removeUser(roomId, userId);
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva sala de Planning Poker' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sala creada exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Unirse a una sala existente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unido a la sala exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala no encontrada' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_room_dto_1.JoinRoomDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Post)('vote'),
    (0, swagger_1.ApiOperation)({ summary: 'Emitir un voto en una sala' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voto registrado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala o usuario no encontrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vote_dto_1.VoteDto]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "vote", null);
__decorate([
    (0, common_1.Post)(':id/reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reiniciar los votos de una sala' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la sala' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Votos reiniciados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "resetVotes", null);
__decorate([
    (0, common_1.Post)(':id/reveal'),
    (0, swagger_1.ApiOperation)({ summary: 'Revelar los votos de una sala' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la sala' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Votos revelados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "revealVotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información de una sala' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la sala' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información de la sala' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Delete)(':roomId/users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un usuario de una sala' }),
    (0, swagger_1.ApiParam)({ name: 'roomId', description: 'ID de la sala' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario eliminado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sala no encontrada' }),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "removeUser", null);
exports.RoomsController = RoomsController = __decorate([
    (0, swagger_1.ApiTags)('rooms'),
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map