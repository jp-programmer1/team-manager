const planningPokerService = require('../services/planningPokerService');

const setupPlanningPokerSocket = (io, socket) => {
  // Unirse a una sala de Planning Poker
  socket.on('join_room', ({ roomId, username }) => {
    socket.join(roomId);
    const roomData = planningPokerService.joinRoom(roomId, socket.id, username);
    
    // Notificar a todos en la sala
    io.to(roomId).emit('room_update', roomData);
    console.log(`Usuario ${username} se unió a la sala ${roomId}`);
  });

  // Manejar envío de votos
  socket.on('submit_vote', ({ roomId, vote }) => {
    const result = planningPokerService.submitVote(roomId, socket.id, vote);
    if (result) {
      io.to(roomId).emit('vote_received', result);
    }
  });

  // Mostrar/ocultar votos
  socket.on('toggle_votes', ({ roomId, show }) => {
    const result = planningPokerService.toggleVotes(roomId, show);
    if (result) {
      io.to(roomId).emit('votes_visibility', result);
    }
  });

  // Reiniciar votación
  socket.on('reset_votes', (roomId) => {
    const result = planningPokerService.resetVotes(roomId);
    if (result) {
      io.to(roomId).emit('votes_reset', result);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Buscar en todas las salas
    for (const [roomId, room] of planningPokerService.rooms.entries()) {
      const user = room.users.get(socket.id);
      if (user) {
        const result = planningPokerService.leaveRoom(roomId, socket.id);
        if (result) {
          if (result.roomDeleted) {
            console.log(`Sala ${roomId} eliminada por estar vacía`);
          } else {
            // Notificar a los demás usuarios
            io.to(roomId).emit('user_left', {
              username: result.username,
              users: result.users,
              votes: result.votes
            });
          }
        }
        break;
      }
    }
  });
};

module.exports = setupPlanningPokerSocket;
