import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoomsService } from '../rooms/rooms.service';
import { VoteDto } from '../common/dtos/vote.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'poker',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Aquí podrías implementar la lógica para manejar la desconexión de usuarios
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; },
  ) {
    try {
      const { roomId } = data;
      const room = this.roomsService.getRoom(roomId);

      if (!room) {
        client.emit('error', { message: 'Sala no encontrada' });
        return;
      }

      // Unir al cliente a la sala

      void client.join(roomId);

      // Notificar a los demás usuarios
      this.server.to(roomId).emit(
        'userJoined',
        room.users.map((user) => ({ id: user.id, username: user.username })),
      );
    } catch (error) {
      this.logger.error('Error al unirse a la sala:', error);
      client.emit('error', { message: 'Error al unirse a la sala' });
    }
  }

  @SubscribeMessage('vote')
  @UsePipes(new ValidationPipe())
  handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() voteDto: VoteDto,
  ) {
    try {
      const { roomId, username, vote } = voteDto;
      const room = this.roomsService.vote(roomId, username, vote);

      // Notificar a todos en la sala sobre el voto (pero sin revelar el voto)
      this.server.to(roomId).emit('userVoted', {
        username,
        hasVoted: true,
      });

      this.logger.log(`Usuario ${username} votó en la sala ${roomId}`);
    } catch (error) {
      this.logger.error('Error al registrar voto:', error);
      client.emit('error', { message: 'Error al registrar voto' });
    }
  }

  @SubscribeMessage('revealVotes')
  handleRevealVotes(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const { roomId } = data;
      const room = this.roomsService.revealVotes(roomId);

      // Enviar los votos revelados a todos en la sala
      this.server.to(roomId).emit('votesRevealed', {
        users: room.users.map((user) => ({
          username: user.username,
          vote: user.vote,
        })),
        showVotes: room.showVotes,
      });

      this.logger.log(`Votos revelados en la sala ${roomId}`);
    } catch (error) {
      this.logger.error('Error al revelar votos:', error);
      client.emit('error', { message: 'Error al revelar votos' });
    }
  }

  @SubscribeMessage('resetVotes')
  handleResetVotes(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const { roomId } = data;
      const room = this.roomsService.resetVotes(roomId);

      // Notificar a todos en la sala que los votos se han reiniciado
      this.server.to(roomId).emit('votesReset', { roomId });

      this.logger.log(`Votos reiniciados en la sala ${roomId}`);
    } catch (error) {
      this.logger.error('Error al reiniciar votos:', error);
      client.emit('error', { message: 'Error al reiniciar votos' });
    }
  }
}
