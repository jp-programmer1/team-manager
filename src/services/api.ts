import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(`${API_URL}/poker`, {
  transports: ['websocket'],
  secure: true,
  withCredentials: true,
});

export const api = {
  createRoom: async (roomName: string, { name, id }: { name: string; id: number }) => {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: roomName, username: name, userId: id }),
    });
    return response.json();
  },
  
  joinRoom: async (roomId: string, username: string, userId: number) => {
    const response = await fetch(`${API_URL}/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, roomId, userId }),
    });
    return response.json();
  },

  getRoom: async (roomId: string) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  getIterations: async (accessToken: string, groupId: string | number) => {
    // URL de la API de GitLab para obtener iteraciones de un grupo
    // Solo obtenemos las iteraciones abiertas (state=opened)
    const url = `https://gitlab.com/api/v4/groups/${groupId}/iterations?state=opened`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las iteraciones');
      }

      const iterations = await response.json();
      return iterations;
    } catch (error) {
      console.error('Error al obtener iteraciones de GitLab:', error);
      throw error;
    }
  },
  getIssues: async (accessToken: string, groupId: string | number, iterationId: string) => {
    const url = `https://gitlab.com/api/v4/groups/${groupId}/issues?iterations=${iterationId}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las iteraciones');
      }

      const iterations = await response.json();
      return iterations;
    } catch (error) {
      console.error('Error al obtener iteraciones de GitLab:', error);
      throw error;
    }
  },

  updateWeight: async (accessToken: string, project_id: number, issueIid: number, weight: number) => {
    const url = `https://gitlab.com/api/v4/projects/${project_id}/issues/${issueIid}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ weight }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error al actualizar weight:", response.status, errorData);
        throw new Error(`Error ${response.status}`);
      }

      const issue = await response.json();
      return issue;
    } catch (error) {
      console.error('Error al actualizar weight:', error);
      throw error;
    }
  },
};
