import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  sku: string;
  name: string;
  description?: string;
  unit: string;
  costPerUnit: number;
  avgUnitCost: number; // Moving Average Cost
  currentStock: number;
  reorderPoint: number;
  supplier?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialSchema = new Schema<IMaterial>(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'lbs', 'pcs', 'bags', 'tons', 'm', 'm2', 'm3', 'liters', 'gallons', 'boxes'],
    },
    costPerUnit: {
      type: Number,
      required: [true, 'Cost per unit is required'],
      min: [0, 'Cost cannot be negative'],
    },
    avgUnitCost: {
      type: Number,
      default: 0,
      min: [0, 'Average unit cost cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: [0, 'Reorder point cannot be negative'],
    },
    supplier: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Cement', 'Steel', 'Bricks', 'Sand', 'Aggregate', 'Paint', 'Electrical', 'Plumbing', 'Hardware', 'Other'],
      default: 'Other',
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

materialSchema.index({ sku: 1 });
materialSchema.index({ name: 1 });
materialSchema.index({ category: 1 });

export default mongoose.model<IMaterial>('Material', materialSchema);
