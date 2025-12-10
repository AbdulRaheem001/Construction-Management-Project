import mongoose, { Schema, Document } from 'mongoose';

interface ITransferItem {
  material: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IStockTransfer extends Document {
  transferNumber: string;
  fromLocation: mongoose.Types.ObjectId;
  fromLocationType: 'Project' | 'Warehouse';
  toLocation: mongoose.Types.ObjectId;
  toLocationType: 'Project' | 'Warehouse';
  items: ITransferItem[];
  status: 'Pending' | 'In Transit' | 'Received' | 'Cancelled';
  transferDate: Date;
  receivedDate?: Date;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockTransferSchema = new Schema<IStockTransfer>(
  {
    transferNumber: {
      type: String,
      required: [true, 'Transfer number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fromLocation: {
      type: Schema.Types.ObjectId,
      refPath: 'fromLocationType',
      required: [true, 'From location is required'],
    },
    fromLocationType: {
      type: String,
      required: true,
      enum: ['Project', 'Warehouse'],
    },
    toLocation: {
      type: Schema.Types.ObjectId,
      refPath: 'toLocationType',
      required: [true, 'To location is required'],
    },
    toLocationType: {
      type: String,
      required: true,
      enum: ['Project', 'Warehouse'],
    },
    items: [
      {
        material: {
          type: Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, 'Quantity cannot be negative'],
        },
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Received', 'Cancelled'],
      default: 'Pending',
    },
    transferDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receivedDate: {
      type: Date,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: transferNumber already has unique: true, which creates an index
stockTransferSchema.index({ fromLocation: 1 });
stockTransferSchema.index({ toLocation: 1 });
stockTransferSchema.index({ status: 1 });

export default mongoose.model<IStockTransfer>('StockTransfer', stockTransferSchema);
