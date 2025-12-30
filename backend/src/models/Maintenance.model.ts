import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
  equipment: mongoose.Types.ObjectId;
  maintenanceType: 'Preventive' | 'Corrective' | 'Inspection';
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  description: string;
  performedBy?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  nextMaintenanceDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    maintenanceType: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Inspection'],
    },
    scheduledDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    nextMaintenanceDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ equipment: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ scheduledDate: 1 });

export default mongoose.model<IMaintenance>('Maintenance', maintenanceSchema);
