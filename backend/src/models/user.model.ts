import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  plaidItems: {
    accessToken: string;
    itemId: string;
    institutionId: string;
    institutionName: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    plaidItems: [{
      accessToken: String,
      itemId: String,
      institutionId: String,
      institutionName: String,
    }],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema); 