import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  role: string;
  payRate: number;
  payType: 'Hourly' | 'Daily' | 'Monthly';
  team?: string;
  contact: string;
  email?: string;
  address?: string;
  dateOfJoining: Date;
  isActive: boolean;
  skills?: string[];
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    payRate: {
      type: Number,
      min: [0, 'Pay rate cannot be negative'],
    },
    payType: {
      type: String,
      enum: ['Hourly', 'Daily', 'Monthly'],
      default: 'Hourly',
    },
    team: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    emergencyContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: employeeId already has unique: true, which creates an index
employeeSchema.index({ name: 1 });
employeeSchema.index({ team: 1 });

export default mongoose.model<IEmployee>('Employee', employeeSchema);
