import mongoose, { Schema, Document } from 'mongoose';

export interface ITimesheet extends Document {
  employee: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  date: Date;
  hoursWorked: number;
  task?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  overtimeHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const timesheetSchema = new Schema<ITimesheet>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    hoursWorked: {
      type: Number,
      required: [true, 'Hours worked is required'],
      min: [0, 'Hours cannot be negative'],
      max: [24, 'Hours cannot exceed 24'],
    },
    task: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Overtime hours cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

timesheetSchema.index({ employee: 1, date: 1 });
timesheetSchema.index({ project: 1 });
timesheetSchema.index({ status: 1 });

export default mongoose.model<ITimesheet>('Timesheet', timesheetSchema);
