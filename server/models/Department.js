const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  designation: {
    type: String,
    required: true
  },
  hodName: {
    type: String,
    trim: true
  },
  hodEmail: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);