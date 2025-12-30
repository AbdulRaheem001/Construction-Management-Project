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
      trim: true,
    },
    projectCode: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    client: {
      type: String,
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    targetCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    initialBudget: {
      type: Number,
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
