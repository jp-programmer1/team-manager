# Planning Poker y Editor de Texto Colaborativo

Aplicación que combina un sistema de Planning Poker con un editor de texto colaborativo en tiempo real, construido con Node.js, Express y Socket.IO.

## Características

### Planning Poker
- Creación de salas de juego
- Votación en tiempo real
- Mostrar/ocultar votos
- Reinicio de votaciones
- Soporte para múltiples usuarios por sala

### Editor de Texto Colaborativo
- Edición en tiempo real
- Sincronización de contenido entre usuarios
- Seguimiento de posición del cursor en tiempo real
- Identificación de usuarios por colores

## Requisitos

- Node.js 14+ y npm

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd planning-poker-node
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

1. Inicia el servidor:
   ```bash
   node server.js
   ```

2. Abre tu navegador en `http://localhost:3000`

### Planning Poker
- Conecta con el tipo "planning"
- Los eventos disponibles son:
  - `join_room`: Unirse a una sala
  - `submit_vote`: Enviar un voto
  - `toggle_votes`: Mostrar/ocultar votos
  - `reset_votes`: Reiniciar la votación

### Editor de Texto Colaborativo
- Conecta con el tipo "editor"
- Los eventos disponibles son:
  - `join_document`: Unirse a un documento
  - `content_change`: Actualizar contenido
  - `cursor_move`: Actualizar posición del cursor

## Estructura del Proyecto

```
planning-poker-node/
├── src/
│   ├── controllers/        # Controladores
│   ├── services/           # Lógica de negocio
│   │   ├── planningPokerService.js
│   │   └── textEditorService.js
│   ├── sockets/            # Controladores de WebSocket
│   │   ├── planningPokerSocket.js
│   │   └── textEditorSocket.js
│   └── public/             # Archivos estáticos (frontend)
├── server.js              # Punto de entrada
└── package.json
```

## API

### Planning Poker
- `POST /api/planning/join` - Unirse a una sala
- `POST /api/planning/vote` - Enviar voto
- `POST /api/planning/toggle-votes` - Mostrar/ocultar votos
- `POST /api/planning/reset` - Reiniciar votación

### Editor de Texto
- `POST /api/editor/join` - Unirse a un documento
- `POST /api/editor/update` - Actualizar contenido
- `POST /api/editor/cursor` - Actualizar posición del cursor

## Despliegue

Puedes desplegar esta aplicación en cualquier servicio que soporte Node.js como:
- Heroku
- Railway
- Render
- Vercel
- AWS Elastic Beanstalk

## Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
