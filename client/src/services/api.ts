import io from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export const socket = io(`${API_URL}/poker`);

export const api = {
  createRoom: async (roomName: string, username: string) => {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomName, username }),
    });
    return response.json();
  },
  
  joinRoom: async (roomId: string, username: string) => {
    const response = await fetch(`${API_URL}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, roomId }),
    });
    return response.json();
  },
};
