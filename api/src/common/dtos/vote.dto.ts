import { IsNotEmpty, IsString } from 'class-validator';

export class VoteDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  vote: string;
}
