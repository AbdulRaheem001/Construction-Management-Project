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
      required: [true, 'Adjustment number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material is required'],
    },
    location: {
      type: Schema.Types.ObjectId,
      refPath: 'locationType',
      required: [true, 'Location is required'],
    },
    locationType: {
      type: String,
      required: true,
      enum: ['Project', 'Warehouse'],
    },
    adjustmentType: {
      type: String,
      enum: ['Increase', 'Decrease'],
      required: [true, 'Adjustment type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: ['Breakage', 'Theft', 'Loss', 'Found', 'Correction', 'Damaged', 'Expired', 'Other'],
    },
    explanation: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requested by is required'],
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

inventoryAdjustmentSchema.index({ adjustmentNumber: 1 });
inventoryAdjustmentSchema.index({ material: 1 });
inventoryAdjustmentSchema.index({ location: 1 });
inventoryAdjustmentSchema.index({ status: 1 });

export default mongoose.model<IInventoryAdjustment>('InventoryAdjustment', inventoryAdjustmentSchema);
