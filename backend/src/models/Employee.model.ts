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
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    payRate: {
      type: Number,
      required: [true, 'Pay rate is required'],
      min: [0, 'Pay rate cannot be negative'],
    },
    payType: {
      type: String,
      enum: ['Hourly', 'Daily', 'Monthly'],
      required: [true, 'Pay type is required'],
      default: 'Hourly',
    },
    team: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact is required'],
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
      required: [true, 'Date of joining is required'],
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

employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ name: 1 });
employeeSchema.index({ team: 1 });

export default mongoose.model<IEmployee>('Employee', employeeSchema);
