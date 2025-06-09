const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentDate: {
    type: Date
  },
  refundDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'refunded'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for frequently queried fields
orderSchema.index({ student: 1 });
orderSchema.index({ course: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Order', orderSchema); 