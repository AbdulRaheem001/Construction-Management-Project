import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  projectName: string;
  projectCode: string;
  client: string;
  clientContact?: string;
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  initialBudget: number;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  location?: string;
  description?: string;
  siteManager?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    projectCode: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    targetCompletionDate: {
      type: Date,
      required: [true, 'Target completion date is required'],
    },
    actualCompletionDate: {
      type: Date,
    },
    initialBudget: {
      type: Number,
      required: [true, 'Initial budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    siteManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

projectSchema.index({ status: 1 });
projectSchema.index({ siteManager: 1 });

export default mongoose.model<IProject>('Project', projectSchema);
