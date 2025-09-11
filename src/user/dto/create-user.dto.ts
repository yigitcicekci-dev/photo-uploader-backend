import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

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

  @ApiProperty({ example: 'Passw0rd!', description: 'User password' })
  @IsString()
  passwordHash: string;

  @ApiProperty({
    example: UserRole.USER,
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either user or admin' })
  role?: UserRole;

  @ApiProperty({ example: 'en_US', description: 'User language preference' })
  @IsOptional()
  @IsString()
  language?: string;
}
