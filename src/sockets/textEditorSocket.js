const textEditorService = require('../services/textEditorService');

const setupTextEditorSocket = (io, socket) => {
  // Unirse a un documento
  socket.on('join_document', ({ documentId, username }) => {
    socket.join(documentId);
    const documentData = textEditorService.joinDocument(documentId, socket.id, username);
    
    // Enviar el estado actual del documento al nuevo usuario
    socket.emit('document_state', documentData);
    
    // Notificar a los demás usuarios sobre el nuevo usuario
    socket.to(documentId).emit('user_joined', {
      user: {
        id: socket.id,
        username,
        color: documentData.users.find(u => u.id === socket.id)?.color
      }
    });
    
    console.log(`Usuario ${username} se unió al documento ${documentId}`);
  });

  // Sincronizar cambios en el contenido
  socket.on('content_change', ({ documentId, content }) => {
    const result = textEditorService.updateContent(documentId, content);
    if (result) {
      // Reenviar los cambios a todos los demás en el documento
      socket.to(documentId).emit('content_updated', { content });
    }
  });

  // Actualizar posición del cursor
  socket.on('cursor_move', ({ documentId, position }) => {
    const result = textEditorService.updateCursor(documentId, socket.id, position);
    if (result) {
      // Notificar a los demás usuarios sobre el movimiento del cursor
      socket.to(documentId).emit('cursor_moved', {
        userId: socket.id,
        position: result.position
      });
    }
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado del editor:', socket.id);
    
    // Buscar en todos los documentos
    for (const [documentId, document] of textEditorService.documents.entries()) {
      const user = document.users.get(socket.id);
      if (user) {
        const result = textEditorService.leaveDocument(documentId, socket.id);
        if (result) {
          if (result.documentDeleted) {
            console.log(`Documento ${documentId} eliminado por estar vacío`);
          } else {
            // Notificar a los demás usuarios
            io.to(documentId).emit('user_left', {
              userId: socket.id,
              username: result.username
            });
          }
        }
        break;
      }
    }
  });
};

module.exports = setupTextEditorSocket;
