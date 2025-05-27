# Planning Poker API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## Descripción

API para un juego de Planning Poker en tiempo real construida con NestJS y WebSockets. Esta aplicación permite a los equipos de desarrollo realizar estimaciones ágiles de manera colaborativa.

## Características

- ✅ Creación de salas de juego
- ✅ Conexión en tiempo real con WebSockets
- ✅ Sistema de votación anónima
- ✅ Revelación de votos
- ✅ Reinicio de votaciones
- ✅ Documentación automática con Swagger

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior) o yarn
- Nest CLI (opcional, para desarrollo)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/planning-poker-node.git
   cd planning-poker-node
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (opcional):
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   PORT=3000
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run start:dev
   ```

   La aplicación estará disponible en `http://localhost:3000`  
   La documentación de la API estará disponible en `http://localhost:3000/api`

## Uso

### Endpoints HTTP

- `POST /rooms` - Crea una nueva sala
- `POST /rooms/join` - Únete a una sala existente
- `POST /rooms/vote` - Emite un voto
- `POST /rooms/:id/reset` - Reinicia los votos de una sala
- `POST /rooms/:id/reveal` - Revela los votos de una sala
- `GET /rooms/:id` - Obtiene la información de una sala
- `DELETE /rooms/:roomId/users/:userId` - Elimina un usuario de una sala

### Eventos WebSocket

La aplicación utiliza el espacio de nombres `/poker` para los WebSockets. Los eventos disponibles son:

- `joinRoom` - Unirse a una sala
- `vote` - Emitir un voto
- `revealVotes` - Revelar los votos
- `resetVotes` - Reiniciar los votos

### Ejemplo de Uso con cURL

1. **Crear una sala:**
   ```bash
   curl -X POST http://localhost:3000/rooms \
     -H "Content-Type: application/json" \
     -d '{"name":"Sprint 15","username":"Juan"}'
   ```

2. **Unirse a una sala:**
   ```bash
   curl -X POST http://localhost:3000/rooms/join \
     -H "Content-Type: application/json" \
     -d '{"roomId":"room-id-aqui","username":"María"}'
   ```

3. **Emitir un voto:**
   ```bash
   curl -X POST http://localhost:3000/rooms/vote \
     -H "Content-Type: application/json" \
     -d '{"roomId":"room-id-aqui","username":"Juan","vote":"5"}'
   ```

## Estructura del Proyecto

```
src/
├── common/               # Código compartido
│   ├── dtos/             # Objetos de transferencia de datos
│   └── interfaces/       # Interfaces de TypeScript
├── events/               # Lógica de WebSockets
├── rooms/                # Módulo de salas
└── app.module.ts         # Módulo principal
```

## Scripts Disponibles

- `npm run start` - Inicia la aplicación en producción
- `npm run start:dev` - Inicia la aplicación en modo desarrollo con recarga en caliente
- `npm run build` - Compila la aplicación TypeScript a JavaScript
- `npm run format` - Formatea el código usando Prettier
- `npm run lint` - Ejecuta el linter en el código
- `npm test` - Ejecuta las pruebas unitarias
- `npm run test:watch` - Ejecuta las pruebas en modo observación
- `npm run test:cov` - Ejecuta las pruebas con cobertura

## Despliegue

Para desplegar la aplicación en producción:

```bash
# Construir la aplicación
npm run build

# Iniciar la aplicación en producción
npm run start:prod
```

## Contribución

Las contribuciones son bienvenidas. Por favor, lee las [pautas de contribución](CONTRIBUTING.md) para más detalles.

## Soporte

Si necesitas ayuda, por favor abre un issue en el repositorio.

## Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).
