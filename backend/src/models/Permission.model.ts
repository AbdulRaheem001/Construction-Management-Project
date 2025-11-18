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
      required: [true, 'Permission name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Permission code is required'],
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
      required: [true, 'Module is required'],
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

permissionSchema.index({ code: 1 });
permissionSchema.index({ module: 1 });

export default mongoose.model<IPermission>('Permission', permissionSchema);
