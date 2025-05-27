import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Room, User } from '../common/interfaces/room.interface';

@Injectable()
export class RoomsService {
  private rooms: Map<string, Room> = new Map();

  createRoom(name: string, username: string): Room {
    const roomId = uuidv4();
    const userId = uuidv4();
    
    const user: User = {
      id: userId,
      username,
      hasVoted: false,
    };

    const room: Room = {
      id: roomId,
      name,
      users: [user],
      showVotes: false,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, username: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    const userId = uuidv4();
    const user: User = {
      id: userId,
      username,
      hasVoted: false,
    };

    room.users.push(user);
    
    return room;
  }

  vote(roomId: string, userId: string, vote: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    const user = room.users.find(u => u.id === userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado en la sala');
    }

    user.vote = vote;
    user.hasVoted = true;

    return room;
  }

  resetVotes(roomId: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    room.users.forEach(user => {
      user.vote = undefined;
      user.hasVoted = false;
    });

    room.showVotes = false;
    return room;
  }

  revealVotes(roomId: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    room.showVotes = true;
    return room;
  }

  getRoom(roomId: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    return room;
  }

  removeUser(roomId: string, userId: string): Room {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    room.users = room.users.filter(user => user.id !== userId);
    
    // Si no quedan usuarios, eliminamos la sala
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }

    return room;
  }
}
