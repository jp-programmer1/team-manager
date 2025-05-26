import { Server, Socket } from 'socket.io';
import { planningPokerService } from '../services/planningPokerService';
import { CustomSocket, ServerToClientEvents, ClientToServerEvents } from '../types/common';

export const setupPlanningPokerSocket = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: CustomSocket
): void => {
  // Unirse a una sala de Planning Poker
  socket.on('join_room', ({ roomId, username }, callback) => {
    try {
      socket.roomId = roomId;
      socket.username = username;
      
      socket.join(roomId);
      const roomData = planningPokerService.joinRoom(roomId, socket.id, username);
      
      // Notificar a todos en la sala
      io.to(roomId).emit('room_update', roomData);
      console.log(`Usuario ${username} se unió a la sala ${roomId}`);
      
      if (callback) callback();
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      if (callback) callback(error as Error);
    }
  });

  // Manejar envío de votos
  socket.on('submit_vote', ({ roomId, vote }) => {
    try {
      const result = planningPokerService.submitVote(roomId, socket.id, vote);
      if (result) {
        io.to(roomId).emit('vote_received', result);
      }
    } catch (error) {
      console.error('Error al enviar voto:', error);
    }
  });

  // Mostrar/ocultar votos
  socket.on('toggle_votes', ({ roomId, show }) => {
    try {
      const result = planningPokerService.toggleVotes(roomId, show);
      if (result) {
        io.to(roomId).emit('votes_visibility', result);
      }
    } catch (error) {
      console.error('Error al cambiar visibilidad de votos:', error);
    }
  });

  // Reiniciar votación
  socket.on('reset_votes', (roomId) => {
    try {
      const result = planningPokerService.resetVotes(roomId);
      if (result) {
        io.to(roomId).emit('votes_reset', result);
      }
    } catch (error) {
      console.error('Error al reiniciar votación:', error);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado del Planning Poker:', socket.id);
    
    if (!socket.roomId) return;
    
    const result = planningPokerService.leaveRoom(socket.roomId, socket.id);
    
    if (result && 'roomDeleted' in result) {
      console.log(`Sala ${socket.roomId} eliminada por estar vacía`);
    } else if (result) {
      // Notificar a los demás usuarios
      io.to(socket.roomId).emit('user_left', {
        username: result.username,
        users: result.users,
        votes: result.votes
      });
    }
  });
};
