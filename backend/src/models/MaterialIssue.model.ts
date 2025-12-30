import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialIssue extends Document {
  project: mongoose.Types.ObjectId;
  material: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number; // Snapshot of avg_unit_cost at time of issue
  totalCost: number; // quantity * unitCost
  issueDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const materialIssueSchema = new Schema<IMaterialIssue>(
  {
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
      min: [0.01, 'Quantity must be greater than 0'],
    },
    unitCost: {
      type: Number,
      min: [0, 'Unit cost cannot be negative'],
    },
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
materialIssueSchema.index({ project: 1 });
materialIssueSchema.index({ material: 1 });
materialIssueSchema.index({ issueDate: -1 });

export default mongoose.model<IMaterialIssue>('MaterialIssue', materialIssueSchema);
