import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Unique username' })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(32, { message: 'Username must not exceed 32 characters' })
  username?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User display name' })
  @IsString()
  @MinLength(3, { message: 'Display name must be at least 3 characters long' })
  @MaxLength(64, { message: 'Display name must not exceed 64 characters' })
  displayName?: string;

  @ApiProperty({ example: 'Passw0rd!', description: 'User password' })
  @IsString()
  passwordHash: string;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'], default: 'user' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'en_US', description: 'User language preference' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Whether user is enabled', default: true })
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: 'Whether user is blocked', default: false })
  @IsOptional()
  blocked?: boolean;

  @ApiProperty({ description: 'Whether user is deleted', default: false })
  @IsOptional()
  deleted?: boolean;
}
