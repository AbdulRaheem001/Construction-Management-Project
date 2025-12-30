import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  material: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId; // Reference to Project or Warehouse
  locationType: 'Project' | 'Warehouse';
  quantity: number;
  binLocation?: string;
  lastUpdated: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const inventorySchema = new Schema<IInventory>(
  {
    material: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
    },
    location: {
      type: Schema.Types.ObjectId,
      refPath: 'locationType',
    },
    locationType: {
      type: String,
      enum: ['Project', 'Warehouse'],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    binLocation: {
      type: String,
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ material: 1, location: 1, locationType: 1 }, { unique: true });
inventorySchema.index({ location: 1 });

export default mongoose.model<IInventory>('Inventory', inventorySchema);
