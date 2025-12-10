import mongoose, { Schema, Document } from 'mongoose';

export interface IGoodsReceipt extends Document {
  grNumber: string;
  purchaseOrder: mongoose.Types.ObjectId;
  receivedDate: Date;
  receivedBy: mongoose.Types.ObjectId;
  items: Array<{
    material: mongoose.Types.ObjectId;
    orderedQuantity: number;
    receivedQuantity: number;
    damagedQuantity?: number;
    notes?: string;
  }>;
  destination: mongoose.Types.ObjectId;
  destinationType: 'Project' | 'Warehouse';
  notes?: string;
  status: 'Partial' | 'Complete';
  createdAt: Date;
  updatedAt: Date;
}

const goodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    grNumber: {
      type: String,
      required: [true, 'GR number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'Purchase order is required'],
    },
    receivedDate: {
      type: Date,
      required: [true, 'Received date is required'],
      default: Date.now,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Received by is required'],
    },
    items: [
      {
        material: {
          type: Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        orderedQuantity: {
          type: Number,
          required: true,
        },
        receivedQuantity: {
          type: Number,
          required: true,
          min: [0, 'Received quantity cannot be negative'],
        },
        damagedQuantity: {
          type: Number,
          default: 0,
          min: [0, 'Damaged quantity cannot be negative'],
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    destination: {
      type: Schema.Types.ObjectId,
      refPath: 'destinationType',
      required: [true, 'Destination is required'],
    },
    destinationType: {
      type: String,
      required: true,
      enum: ['Project', 'Warehouse'],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Partial', 'Complete'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: grNumber already has unique: true, which creates an index
goodsReceiptSchema.index({ purchaseOrder: 1 });

export default mongoose.model<IGoodsReceipt>('GoodsReceipt', goodsReceiptSchema);
