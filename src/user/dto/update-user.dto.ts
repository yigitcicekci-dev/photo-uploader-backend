import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

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

  @ApiProperty({ example: 'Passw0rd!', required: false })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: UserRole.USER, enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either user or admin' })
  role?: UserRole;
}

export class UpdateMeUserDto {
  @ApiProperty({ example: 'johndoe', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(32)
  username?: string;

  @ApiProperty({
    required: false,
    description: 'Language code (e.g., "en", "tr", "en_US")',
    example: 'en_US',
  })
  @IsOptional()
  @IsString()
  language?: string;
}
