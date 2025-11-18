import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipmentUsage extends Document {
  equipment: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  hoursUsed?: number;
  daysUsed?: number;
  operator?: mongoose.Types.ObjectId;
  costPerHour?: number;
  costPerDay?: number;
  totalCost: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentUsageSchema = new Schema<IEquipmentUsage>(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    hoursUsed: {
      type: Number,
      min: [0, 'Hours cannot be negative'],
    },
    daysUsed: {
      type: Number,
      min: [0, 'Days cannot be negative'],
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    costPerHour: {
      type: Number,
      min: [0, 'Cost per hour cannot be negative'],
    },
    costPerDay: {
      type: Number,
      min: [0, 'Cost per day cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

equipmentUsageSchema.index({ equipment: 1 });
equipmentUsageSchema.index({ project: 1 });

export default mongoose.model<IEquipmentUsage>('EquipmentUsage', equipmentUsageSchema);
