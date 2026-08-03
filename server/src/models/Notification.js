const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['application', 'interview', 'offer', 'announcement', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const announcementSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null }, // null = college-wide
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = { Notification, Announcement };
