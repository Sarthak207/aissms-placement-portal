const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coordinator', coordinatorSchema);
