import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, UpdateMeUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateUserDto | UpdateMeUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async updateById(
    id: string | Types.ObjectId,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }


  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return !!user;
  }

  async findAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async getUsersCount(): Promise<number> {
    return this.userModel.countDocuments();
  }
}
