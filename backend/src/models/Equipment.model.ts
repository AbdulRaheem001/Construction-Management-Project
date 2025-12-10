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
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    makeModel: {
      type: String,
      required: [true, 'Make/Model is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Heavy Machinery', 'Power Tools', 'Hand Tools', 'Vehicles', 'Safety Equipment', 'Measuring Instruments', 'Other'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    purchaseValue: {
      type: Number,
      required: [true, 'Purchase value is required'],
      min: [0, 'Purchase value cannot be negative'],
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
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
      required: [true, 'Location is required'],
    },
    locationType: {
      type: String,
      required: true,
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
