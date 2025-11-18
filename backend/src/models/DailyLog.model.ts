import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLog extends Document {
  project: mongoose.Types.ObjectId;
  date: Date;
  weather: string;
  temperature?: string;
  progress: string;
  activitiesCompleted: string[];
  workforcePresent: number;
  equipmentUsed: string[];
  safetyIncidents?: string;
  visitorsOnSite?: string;
  materialsReceived?: string;
  issues?: string;
  notes?: string;
  photos?: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLogSchema = new Schema<IDailyLog>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    weather: {
      type: String,
      required: [true, 'Weather is required'],
      enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Windy', 'Hot', 'Cold'],
    },
    temperature: {
      type: String,
      trim: true,
    },
    progress: {
      type: String,
      required: [true, 'Progress is required'],
      trim: true,
    },
    activitiesCompleted: [
      {
        type: String,
        trim: true,
      },
    ],
    workforcePresent: {
      type: Number,
      required: [true, 'Workforce present is required'],
      min: [0, 'Workforce cannot be negative'],
    },
    equipmentUsed: [
      {
        type: String,
        trim: true,
      },
    ],
    safetyIncidents: {
      type: String,
      trim: true,
    },
    visitorsOnSite: {
      type: String,
      trim: true,
    },
    materialsReceived: {
      type: String,
      trim: true,
    },
    issues: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    photos: [
      {
        type: String,
        trim: true,
      },
    ],
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

dailyLogSchema.index({ project: 1, date: 1 }, { unique: true });
dailyLogSchema.index({ date: 1 });

export default mongoose.model<IDailyLog>('DailyLog', dailyLogSchema);
