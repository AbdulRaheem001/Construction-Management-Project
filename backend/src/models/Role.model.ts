import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string;
  description?: string;
  permissions: mongoose.Types.ObjectId[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Role code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
      // System roles (like ADMINISTRATOR) cannot be deleted
    },
  },
  {
    timestamps: true,
  }
);

// Note: code already has unique: true, which creates an index

export default mongoose.model<IRole>('Role', roleSchema);
