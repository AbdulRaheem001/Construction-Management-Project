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
      unique: true,
      trim: true,
      uppercase: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
    },
    quantity: {
      type: Number,
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
      default: Date.now,
    },
    purpose: {
      type: String,
      trim: true,
    },
    consumedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
