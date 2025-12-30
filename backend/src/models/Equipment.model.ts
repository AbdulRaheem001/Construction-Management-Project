import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment extends Document {
  assetId: string;
  name: string;
  makeModel: string;
  category: string;
  purchaseDate: Date;
  purchaseValue: number;
  currentValue: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Under Repair';
  location: mongoose.Types.ObjectId;
  locationType: 'Project' | 'Warehouse';
  serialNumber?: string;
  specifications?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
  {
    assetId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    makeModel: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Heavy Machinery', 'Power Tools', 'Hand Tools', 'Vehicles', 'Safety Equipment', 'Measuring Instruments', 'Other'],
    },
    purchaseDate: {
      type: Date,
    },
    purchaseValue: {
      type: Number,
      min: [0, 'Purchase value cannot be negative'],
    },
    currentValue: {
      type: Number,
      min: [0, 'Current value cannot be negative'],
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Under Repair'],
      default: 'Good',
    },
    location: {
      type: Schema.Types.ObjectId,
      refPath: 'locationType',
    },
    locationType: {
      type: String,
      enum: ['Project', 'Warehouse'],
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    specifications: {
      type: String,
      trim: true,
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

// Note: assetId already has unique: true, which creates an index
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ category: 1 });

export default mongoose.model<IEquipment>('Equipment', equipmentSchema);
