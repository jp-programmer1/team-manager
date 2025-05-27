import io from 'socket.io-client';

const API_URL = 'http://localhost:3000';

export const socket = io(API_URL);

export const api = {
  createRoom: async (roomName: string, userName: string) => {
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomName, userName }),
    });
    return response.json();
  },
  
  joinRoom: async (roomId: string, userName: string) => {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName }),
    });
    return response.json();
  },
};
