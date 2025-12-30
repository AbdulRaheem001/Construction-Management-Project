import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  code: string;
  description?: string;
  module: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    module: {
      type: String,
      enum: ['Projects', 'Materials', 'Labour', 'Equipment', 'Warehouse', 'Expenses', 'Users', 'Roles', 'System'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: code already has unique: true, which creates an index
permissionSchema.index({ module: 1 });

export default mongoose.model<IPermission>('Permission', permissionSchema);
