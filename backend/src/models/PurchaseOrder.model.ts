import mongoose, { Schema, Document } from 'mongoose';

interface IPOItem {
  material: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  project: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  supplier: string;
  supplierContact?: string;
  items: IPOItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Received' | 'Partially Received' | 'Cancelled';
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: {
      type: String,
      required: [true, 'PO number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true,
    },
    supplierContact: {
      type: String,
      trim: true,
    },
    items: [
      {
        material: {
          type: Schema.Types.ObjectId,
          ref: 'Material',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, 'Quantity cannot be negative'],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, 'Unit price cannot be negative'],
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Received', 'Partially Received', 'Cancelled'],
      default: 'Draft',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    receivedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Note: poNumber already has unique: true, which creates an index
purchaseOrderSchema.index({ project: 1 });
purchaseOrderSchema.index({ status: 1 });

export default mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
