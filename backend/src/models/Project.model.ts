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

// Cascade delete middleware
projectSchema.pre('findOneAndDelete', async function (next) {
  try {
    const projectId = this.getQuery()._id;

    // Import models (lazy loading to avoid circular dependencies)
    const Inventory = mongoose.model('Inventory');
    const MaterialIssue = mongoose.model('MaterialIssue');
    const DailyLog = mongoose.model('DailyLog');
    const Expense = mongoose.model('Expense');
    const EquipmentUsage = mongoose.model('EquipmentUsage');
    const MaterialConsumption = mongoose.model('MaterialConsumption');
    const Timesheet = mongoose.model('Timesheet');
    const PurchaseOrder = mongoose.model('PurchaseOrder');
    const Warehouse = mongoose.model('Warehouse');

    // Delete all related records in parallel
    await Promise.all([
      // Delete inventory records where location is this project
      Inventory.deleteMany({ location: projectId, locationType: 'Project' }),
      
      // Delete material issues for this project
      MaterialIssue.deleteMany({ project: projectId }),
      
      // Delete daily logs for this project
      DailyLog.deleteMany({ project: projectId }),
      
      // Delete expenses for this project
      Expense.deleteMany({ project: projectId }),
      
      // Delete equipment usage for this project
      EquipmentUsage.deleteMany({ project: projectId }),
      
      // Delete material consumption for this project
      MaterialConsumption.deleteMany({ project: projectId }),
      
      // Delete timesheets for this project
      Timesheet.deleteMany({ project: projectId }),
      
      // Delete purchase orders for this project
      PurchaseOrder.deleteMany({ project: projectId }),
      
      // Update warehouses - remove project reference
      Warehouse.updateMany({ project: projectId }, { $set: { project: null } }),
    ]);

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Also handle deleteOne
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const projectId = this._id;

    const Inventory = mongoose.model('Inventory');
    const MaterialIssue = mongoose.model('MaterialIssue');
    const DailyLog = mongoose.model('DailyLog');
    const Expense = mongoose.model('Expense');
    const EquipmentUsage = mongoose.model('EquipmentUsage');
    const MaterialConsumption = mongoose.model('MaterialConsumption');
    const Timesheet = mongoose.model('Timesheet');
    const PurchaseOrder = mongoose.model('PurchaseOrder');
    const Warehouse = mongoose.model('Warehouse');

    await Promise.all([
      Inventory.deleteMany({ location: projectId, locationType: 'Project' }),
      MaterialIssue.deleteMany({ project: projectId }),
      DailyLog.deleteMany({ project: projectId }),
      Expense.deleteMany({ project: projectId }),
      EquipmentUsage.deleteMany({ project: projectId }),
      MaterialConsumption.deleteMany({ project: projectId }),
      Timesheet.deleteMany({ project: projectId }),
      PurchaseOrder.deleteMany({ project: projectId }),
      Warehouse.updateMany({ project: projectId }, { $set: { project: null } }),
    ]);

    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IProject>('Project', projectSchema);
