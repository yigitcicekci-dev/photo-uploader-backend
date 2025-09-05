import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty({ example: '60f1b2b3b3b3b3b3b3b3b3b3' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'add', enum: ['add', 'remove'] })
  @IsString()
  @IsIn(['add', 'remove'])
  action: 'add' | 'remove';
}
