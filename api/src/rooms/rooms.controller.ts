import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Post, 
  Delete,
  NotFoundException 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam 
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '../common/dtos/create-room.dto';
import { JoinRoomDto } from '../common/dtos/join-room.dto';
import { VoteDto } from '../common/dtos/vote.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sala de Planning Poker' })
  @ApiResponse({ status: 201, description: 'Sala creada exitosamente' })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(
      createRoomDto.name, 
      createRoomDto.username
    );
  }

  @Post('join')
  @ApiOperation({ summary: 'Unirse a una sala existente' })
  @ApiResponse({ status: 200, description: 'Unido a la sala exitosamente' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  joinRoom(@Body() joinRoomDto: JoinRoomDto) {
    return this.roomsService.joinRoom(joinRoomDto.roomId, joinRoomDto.username);
  }

  @Post('vote')
  @ApiOperation({ summary: 'Emitir un voto en una sala' })
  @ApiResponse({ status: 200, description: 'Voto registrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Sala o usuario no encontrado' })
  vote(@Body() voteDto: VoteDto) {
    return this.roomsService.vote(
      voteDto.roomId, 
      voteDto.username, 
      voteDto.vote
    );
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Reiniciar los votos de una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  @ApiResponse({ status: 200, description: 'Votos reiniciados exitosamente' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  resetVotes(@Param('id') roomId: string) {
    return this.roomsService.resetVotes(roomId);
  }

  @Post(':id/reveal')
  @ApiOperation({ summary: 'Revelar los votos de una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  @ApiResponse({ status: 200, description: 'Votos revelados exitosamente' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  revealVotes(@Param('id') roomId: string) {
    return this.roomsService.revealVotes(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de una sala' })
  @ApiParam({ name: 'id', description: 'ID de la sala' })
  @ApiResponse({ status: 200, description: 'Información de la sala' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  getRoom(@Param('id') roomId: string) {
    const room = this.roomsService.getRoom(roomId);
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }
    return room;
  }

  @Delete(':roomId/users/:userId')
  @ApiOperation({ summary: 'Eliminar un usuario de una sala' })
  @ApiParam({ name: 'roomId', description: 'ID de la sala' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Sala no encontrada' })
  removeUser(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    return this.roomsService.removeUser(roomId, userId);
  }
}
