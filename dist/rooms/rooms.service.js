"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let RoomsService = class RoomsService {
    rooms = new Map();
    createRoom(name, username) {
        const roomId = (0, uuid_1.v4)();
        const userId = (0, uuid_1.v4)();
        const user = {
            id: userId,
            username,
            hasVoted: false,
        };
        const room = {
            id: roomId,
            name,
            users: [user],
            showVotes: false,
            createdAt: new Date(),
        };
        this.rooms.set(roomId, room);
        return room;
    }
    joinRoom(roomId, username) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        const userId = (0, uuid_1.v4)();
        const user = {
            id: userId,
            username,
            hasVoted: false,
        };
        room.users.push(user);
        return room;
    }
    vote(roomId, userId, vote) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        const user = room.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado en la sala');
        }
        user.vote = vote;
        user.hasVoted = true;
        return room;
    }
    resetVotes(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        room.users.forEach(user => {
            user.vote = undefined;
            user.hasVoted = false;
        });
        room.showVotes = false;
        return room;
    }
    revealVotes(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        room.showVotes = true;
        return room;
    }
    getRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        return room;
    }
    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new common_1.NotFoundException('Sala no encontrada');
        }
        room.users = room.users.filter(user => user.id !== userId);
        if (room.users.length === 0) {
            this.rooms.delete(roomId);
        }
        return room;
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)()
], RoomsService);
//# sourceMappingURL=rooms.service.js.map