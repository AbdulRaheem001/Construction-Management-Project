import mongoose, { Schema } from 'mongoose';

export interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
