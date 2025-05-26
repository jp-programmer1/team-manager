class PlanningPokerService {
  constructor() {
    this.rooms = new Map();
  }

  // Crear o unirse a una sala
  joinRoom(roomId, userId, username) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Map(),
        votes: new Map(),
        showVotes: false
      });
    }

    const room = this.rooms.get(roomId);
    
    // Añadir usuario a la sala
    room.users.set(userId, {
      id: userId,
      username,
      voted: false,
      vote: null
    });

    return {
      users: Array.from(room.users.values()),
      votes: room.showVotes ? Object.fromEntries(room.votes) : {},
      showVotes: room.showVotes
    };
  }

  // Enviar un voto
  submitVote(roomId, userId, vote) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(userId);
    if (!user) return null;

    // Actualizar voto
    user.voted = true;
    user.vote = vote;
    room.votes.set(user.username, vote);

    // Verificar si todos han votado
    const allVoted = Array.from(room.users.values()).every(u => u.voted);

    return {
      username: user.username,
      allVoted,
      votes: room.showVotes ? Object.fromEntries(room.votes) : {}
    };
  }

  // Mostrar/ocultar votos
  toggleVotes(roomId, show) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.showVotes = show;
    
    return {
      showVotes: room.showVotes,
      votes: room.showVotes ? Object.fromEntries(room.votes) : {}
    };
  }

  // Reiniciar votación
  resetVotes(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Reiniciar votos
    room.votes.clear();
    room.showVotes = false;

    // Reiniciar estado de usuarios
    room.users.forEach(user => {
      user.voted = false;
      user.vote = null;
    });

    return {
      users: Array.from(room.users.values()),
      votes: {},
      showVotes: false
    };
  }

  // Eliminar usuario de la sala
  leaveRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(userId);
    if (!user) return null;

    // Eliminar usuario
    room.users.delete(userId);
    room.votes.delete(user.username);

    // Si la sala queda vacía, eliminarla
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      return { roomDeleted: true };
    }

    return {
      username: user.username,
      users: Array.from(room.users.values()),
      votes: room.showVotes ? Object.fromEntries(room.votes) : {}
    };
  }
}

module.exports = new PlanningPokerService();
