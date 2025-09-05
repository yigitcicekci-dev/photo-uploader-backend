import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'johndoe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(32)
  username?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(64)
  displayName?: string;

  @ApiProperty({ example: 'Passw0rd!', required: false })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  deletedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  blocked?: boolean;

  @ApiProperty({ example: 'user', enum: ['user', 'admin'], required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateMeUserDto {
  @ApiProperty({ example: 'johndoe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(32)
  username?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(64)
  displayName?: string;

  @ApiProperty({
    required: false,
    description: 'Language code (e.g., "en", "tr", "en_US")',
    example: 'en_US',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    required: false,
    description: 'Display name last updated',
  })
  @IsOptional()
  displayNameUpdated?: Date;
}
