import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialConsumption extends Document {
  consumptionNumber: string;
  project: mongoose.Types.ObjectId;
  material: mongoose.Types.ObjectId;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  purpose?: string;
  consumedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  usedBy?: string;
  issuedFrom?: 'Warehouse' | 'Project';
  warehouseId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const materialConsumptionSchema = new Schema<IMaterialConsumption>(
  {
    consumptionNumber: {
      type: String,
      required: [true, 'Consumption number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    purpose: {
      type: String,
      trim: true,
    },
    consumedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Consumed by is required'],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    usedBy: {
      type: String,
      trim: true,
    },
    issuedFrom: {
      type: String,
      enum: ['Warehouse', 'Project'],
      default: 'Project',
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Note: consumptionNumber already has unique: true, which creates an index
materialConsumptionSchema.index({ project: 1 });
materialConsumptionSchema.index({ material: 1 });

export default mongoose.model<IMaterialConsumption>('MaterialConsumption', materialConsumptionSchema);
