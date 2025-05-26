class TextEditorService {
  constructor() {
    this.documents = new Map();
  }

  // Crear o unirse a un documento
  joinDocument(documentId, userId, username) {
    if (!this.documents.has(documentId)) {
      this.documents.set(documentId, {
        content: '',
        users: new Map(),
        cursorPositions: new Map()
      });
    }

    const document = this.documents.get(documentId);
    
    // Añadir usuario al documento
    document.users.set(userId, {
      id: userId,
      username,
      color: this.getRandomColor()
    });

    return {
      content: document.content,
      users: Array.from(document.users.values()),
      cursorPositions: Object.fromEntries(document.cursorPositions)
    };
  }

  // Actualizar el contenido del documento
  updateContent(documentId, content) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.content = content;
    return { success: true };
  }

  // Actualizar posición del cursor
  updateCursor(documentId, userId, position) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const user = document.users.get(userId);
    if (!user) return null;

    document.cursorPositions.set(userId, {
      ...position,
      username: user.username,
      color: user.color
    });

    return {
      userId,
      position: {
        ...position,
        username: user.username,
        color: user.color
      }
    };
  }

  // Eliminar usuario del documento
  leaveDocument(documentId, userId) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const user = document.users.get(userId);
    if (!user) return null;

    // Eliminar usuario
    document.users.delete(userId);
    document.cursorPositions.delete(userId);

    // Si el documento queda vacío, eliminarlo
    if (document.users.size === 0) {
      this.documents.delete(documentId);
      return { documentDeleted: true };
    }

    return {
      userId,
      username: user.username
    };
  }

  // Generar un color aleatorio para el cursor del usuario
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

module.exports = new TextEditorService();
