import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  location: string;
  manager?: mongoose.Types.ObjectId;
  capacity?: number;
  isActive: boolean;
  project?: mongoose.Types.ObjectId; // Optional reference to Project
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    capacity: {
      type: Number,
      min: [0, 'Capacity cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Note: code already has unique: true, which creates an index

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
