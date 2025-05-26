import { Server, Socket } from 'socket.io';
import { textEditorService } from '../services/textEditorService';
import { CustomSocket, ServerToClientEvents, ClientToServerEvents } from '../types/common';

export const setupTextEditorSocket = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: CustomSocket
): void => {
  // Unirse a un documento
  socket.on('join_document', ({ documentId, username }, callback) => {
    try {
      socket.documentId = documentId;
      socket.username = username;
      
      socket.join(documentId);
      const documentData = textEditorService.joinDocument(documentId, socket.id, username);
      
      // Enviar el estado actual del documento al nuevo usuario
      socket.emit('document_state', documentData);
      
      // Notificar a los demás usuarios sobre el nuevo usuario
      const user = documentData.users.find(u => u.id === socket.id);
      if (user) {
        socket.to(documentId).emit('user_joined', {
          user: {
            id: socket.id,
            username: user.username,
            color: user.color
          }
        });
      }
      
      console.log(`Usuario ${username} se unió al documento ${documentId}`);
      if (callback) callback();
    } catch (error) {
      console.error('Error al unirse al documento:', error);
      if (callback) callback(error as Error);
    }
  });

  // Sincronizar cambios en el contenido
  socket.on('content_change', ({ documentId, content }) => {
    try {
      const result = textEditorService.updateContent(documentId, content);
      if (result) {
        // Reenviar los cambios a todos los demás en el documento
        socket.to(documentId).emit('content_updated', { content });
      }
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
    }
  });

  // Actualizar posición del cursor
  socket.on('cursor_move', ({ documentId, position }) => {
    try {
      const result = textEditorService.updateCursor(documentId, socket.id, position);
      if (result) {
        // Notificar a los demás usuarios sobre el movimiento del cursor
        socket.to(documentId).emit('cursor_moved', {
          userId: socket.id,
          position: result.position
        });
      }
    } catch (error) {
      console.error('Error al actualizar posición del cursor:', error);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado del editor:', socket.id);
    
    if (!socket.documentId) return;
    
    const result = textEditorService.leaveDocument(socket.documentId, socket.id);
    
    if (result && 'documentDeleted' in result) {
      console.log(`Documento ${socket.documentId} eliminado por estar vacío`);
    } else if (result) {
      // Notificar a los demás usuarios
      io.to(socket.documentId).emit('user_left', {
        username: result.username,
        users: [], // Agregamos un array vacío para cumplir con el tipo
        votes: {}  // Agregamos un objeto vacío para cumplir con el tipo
      });
    }
  });
};
