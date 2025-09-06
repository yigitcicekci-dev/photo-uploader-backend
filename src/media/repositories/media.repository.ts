import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument } from '../schemas/media.schema';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}

  async create(mediaData: Partial<Media>): Promise<MediaDocument> {
    const media = new this.mediaModel(mediaData);
    return media.save();
  }

  async findById(id: string | Types.ObjectId): Promise<MediaDocument | null> {
    return this.mediaModel.findById(id).populate('ownerId', 'email').exec();
  }

  async findByOwnerId(
    ownerId: string | Types.ObjectId,
  ): Promise<MediaDocument[]> {
    const objectId =
      typeof ownerId === 'string' ? new Types.ObjectId(ownerId) : ownerId;
    return this.mediaModel
      .find({ ownerId: objectId })
      .populate('ownerId', 'email')
      .exec();
  }

  async findAccessibleByUserId(
    userId: string | Types.ObjectId,
  ): Promise<MediaDocument[]> {
    const objectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.mediaModel
      .find({
        $or: [{ ownerId: objectId }, { allowedUserIds: { $in: [objectId] } }],
      })
      .populate('ownerId', 'email')
      .exec();
  }

  async updateById(
    id: string | Types.ObjectId,
    updateData: Partial<Media>,
  ): Promise<MediaDocument | null> {
    return this.mediaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('ownerId', 'email')
      .exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<MediaDocument | null> {
    return this.mediaModel.findByIdAndDelete(id).exec();
  }

  async addPermission(
    mediaId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<MediaDocument | null> {
    return this.mediaModel
      .findByIdAndUpdate(
        mediaId,
        { $addToSet: { allowedUserIds: userId } },
        { new: true },
      )
      .populate('ownerId', 'email')
      .exec();
  }

  async removePermission(
    mediaId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<MediaDocument | null> {
    return this.mediaModel
      .findByIdAndUpdate(
        mediaId,
        { $pull: { allowedUserIds: userId } },
        { new: true },
      )
      .populate('ownerId', 'email')
      .exec();
  }

  async delete(
    mediaId: string | Types.ObjectId,
  ): Promise<MediaDocument | null> {
    return this.mediaModel.findByIdAndDelete(mediaId).exec();
  }
}
