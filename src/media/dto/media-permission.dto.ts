import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PermissionAction {
  ADD = 'add',
  REMOVE = 'remove',
}

export class MediaPermissionDto {
  @ApiProperty({
    example: '60f1b2b3b3b3b3b3b3b3b3b3',
    description: 'User ID to grant/revoke permission',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    example: PermissionAction.ADD,
    enum: PermissionAction,
    description: 'Action to perform: add or remove permission',
  })
  @IsEnum(PermissionAction, { message: 'Action must be either add or remove' })
  action: PermissionAction;
}
