import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentHistory {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  notes?: string;
  paidBy?: mongoose.Types.ObjectId;
}

export interface IExpense extends Document {
  expenseNumber: string;
  project?: mongoose.Types.ObjectId;
  category: string;
  expenseType: 'Material' | 'Labour' | 'Equipment' | 'General' | 'Overhead';
  description: string;
  amount: number;
  amountPaid?: number;
  paymentHistory?: IPaymentHistory[];
  date: Date;
  vendor?: string;
  invoiceNumber?: string;
  invoiceAttachment?: string;
  images?: string[];
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';
  paymentMethod?: string;
  paymentDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    expenseNumber: {
      type: String,
      required: [true, 'Expense number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Permits',
        'Utilities',
        'Transportation',
        'Accommodation',
        'Insurance',
        'Legal',
        'Consulting',
        'Office Supplies',
        'Communications',
        'Marketing',
        'Training',
        'Safety Equipment',
        'Waste Disposal',
        'Security',
        'Other',
      ],
    },
    expenseType: {
      type: String,
      enum: ['Material', 'Labour', 'Equipment', 'General', 'Overhead'],
      required: [true, 'Expense type is required'],
      default: 'General',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    amountPaid: {
      type: Number,
      min: [0, 'Amount paid cannot be negative'],
      default: 0,
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
          min: [0, 'Payment amount cannot be negative'],
        },
        paymentDate: {
          type: Date,
          required: true,
          default: Date.now,
        },
        paymentMethod: {
          type: String,
          enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Online Payment'],
        },
        notes: {
          type: String,
        },
        paidBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    vendor: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    invoiceAttachment: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Check', 'Bank Transfer', 'Credit Card', 'Online Payment'],
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
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
  },
  {
    timestamps: true,
  }
);

// Note: expenseNumber already has unique: true, which creates an index
expenseSchema.index({ project: 1 });
expenseSchema.index({ expenseType: 1 });
expenseSchema.index({ paymentStatus: 1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);
