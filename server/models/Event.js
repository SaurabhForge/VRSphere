const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    roomType: {
      type: String,
      enum: ['classroom', 'auditorium', 'lounge'],
      default: 'classroom',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    joinCode: {
      type: String,
      unique: true,
      default: () => uuidv4().slice(0, 8).toUpperCase(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxAttendees: {
      type: Number,
      default: 20,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Compound index for quick lookups (joinCode already unique via field def)
eventSchema.index({ startTime: 1 });
eventSchema.index({ host: 1 });

module.exports = mongoose.model('Event', eventSchema);
