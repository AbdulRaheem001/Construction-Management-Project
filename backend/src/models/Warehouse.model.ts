import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  location: string;
  manager?: mongoose.Types.ObjectId;
  capacity?: number;
  isActive: boolean;
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
  },
  {
    timestamps: true,
  }
);

warehouseSchema.index({ code: 1 });

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
