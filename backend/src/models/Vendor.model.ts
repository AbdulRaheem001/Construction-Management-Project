import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  vendorCode: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  taxId?: string;
  isActive: boolean;
  totalPurchases: number;
  outstandingPayments: number;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    vendorCode: {
      type: String,
      required: [true, 'Vendor code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'Pakistan',
    },
    paymentTerms: {
      type: String,
      trim: true,
      default: 'Net 30',
    },
    taxId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingPayments: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Note: vendorCode already has unique: true, which creates an index
vendorSchema.index({ name: 1 });

export default mongoose.model<IVendor>('Vendor', vendorSchema);
