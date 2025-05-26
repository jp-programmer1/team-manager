import { CursorPosition, Document, User } from '../types/common';

export class TextEditorService {
  private documents: Map<string, Document>;

  constructor() {
    this.documents = new Map<string, Document>();
  }

  // Obtener todos los documentos (solo para pruebas)
  public getDocuments(): Map<string, Document> {
    return this.documents;
  }

  // Unirse a un documento
  public joinDocument(documentId: string, userId: string, username: string) {
    if (!this.documents.has(documentId)) {
      this.documents.set(documentId, {
        content: '',
        users: new Map<string, User>(),
        cursorPositions: new Map<string, CursorPosition>()
      });
    }

    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Error al crear el documento');
    }
    
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
  public updateContent(documentId: string, content: string) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    document.content = content;
    return { success: true };
  }

  // Actualizar posición del cursor
  public updateCursor(
    documentId: string, 
    userId: string, 
    position: Omit<CursorPosition, 'username' | 'color'>
  ) {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const user = document.users.get(userId);
    if (!user) return null;

    const cursorPosition: CursorPosition = {
      ...position,
      username: user.username,
      color: user.color || '#000000'
    };

    document.cursorPositions.set(userId, cursorPosition);

    return {
      userId,
      position: cursorPosition
    };
  }

  // Eliminar usuario del documento
  public leaveDocument(documentId: string, userId: string) {
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
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

// Exportar una instancia del servicio
export const textEditorService = new TextEditorService();
