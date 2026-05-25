const mongoose = require('mongoose');
 
const offerSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suggestedTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);
 
// One volunteer can only offer once per request
offerSchema.index({ request: 1, volunteer: 1 }, { unique: true });
 
module.exports = mongoose.model('Offer', offerSchema);