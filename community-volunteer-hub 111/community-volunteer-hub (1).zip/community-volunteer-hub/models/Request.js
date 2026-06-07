const mongoose = require('mongoose');
 
const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Home Tasks', 'IT Repair', 'Gardening', 'Tutoring', 'Pet Care', 'Transportation', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    // NEW: explicit online vs in-person flag
    requestType: {
      type: String,
      enum: ['online', 'in-person'],
      default: 'in-person',
    },
    desiredDate: {
      type: Date,
    },
    desiredTime: {
      type: String,
    },
    flexible: {
      type: Boolean,
      default: false,
    },
    meetingType: {
    type: String,
    enum: ['Online', 'In-Person'],
    default: 'In-Person',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    image: {
      type: String,
      default: null,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Request', requestSchema);