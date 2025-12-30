import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryAdjustment extends Document {
  adjustmentNumber: string;
  material: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  locationType: 'Project' | 'Warehouse';
  adjustmentType: 'Increase' | 'Decrease';
  quantity: number;
  reason: string;
  explanation?: string;
  date: Date;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryAdjustmentSchema = new Schema<IInventoryAdjustment>(
  {
    adjustmentNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
    },
    location: {
      type: Schema.Types.ObjectId,
      refPath: 'locationType',
    },
    locationType: {
      type: String,
      enum: ['Project', 'Warehouse'],
    },
    adjustmentType: {
      type: String,
      enum: ['Increase', 'Decrease'],
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
    },
    reason: {
      type: String,
      enum: ['Breakage', 'Theft', 'Loss', 'Found', 'Correction', 'Damaged', 'Expired', 'Other'],
    },
    explanation: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: adjustmentNumber already has unique: true, which creates an index
inventoryAdjustmentSchema.index({ material: 1 });
inventoryAdjustmentSchema.index({ location: 1 });
inventoryAdjustmentSchema.index({ status: 1 });

export default mongoose.model<IInventoryAdjustment>('InventoryAdjustment', inventoryAdjustmentSchema);
