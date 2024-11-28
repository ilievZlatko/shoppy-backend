import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionRequest {
  @IsString()
  @IsNotEmpty()
  productId: string;
}
