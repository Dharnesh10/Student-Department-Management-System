const mongoose = require('mongoose');

const semesterResultSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  courses: [{
    courseCode: String,
    courseName: String,
    credits: Number,
    grade: String,
    gradePoint: Number
  }],
  sgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  totalCredits: Number
}, { _id: false });

const extraCurricularSchema = new mongoose.Schema({
  activityName: String,
  category: {
    type: String,
    enum: ['Sports', 'Cultural', 'Technical', 'Social Service', 'Placement', 'Other']
  },
  level: {
    type: String,
    enum: ['College', 'University', 'State', 'National', 'International']
  },
  position: String,
  date: Date,
  description: String,
  certificate: String // URL or path
}, { _id: false });

const studentSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  departmentCode: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  yearOfJoining: {
    type: Number,
    required: true
  },
  currentYear: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  currentSemester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  status: {
    type: String,
    enum: ['Active', 'Graduated', 'Discontinued', 'On Leave'],
    default: 'Active'
  },
  mentorName: {
    type: String
  },
  mentorId: {
    type: String
  },
  specialization: {
    type: String
  },
  // Academic Performance
  semesterResults: [semesterResultSchema],
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  arrears: {
    type: Number,
    default: 0
  },
  // Extra Curricular Activities
  extraCurricular: [extraCurricularSchema],
  // Attendance
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Skills & Certifications
  skills: [{
    skillName: String,
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  // Placement Details
  placementStatus: {
    type: String,
    enum: ['Not Placed', 'Placed', 'Higher Studies', 'Entrepreneur'],
    default: 'Not Placed'
  },
  companyName: String,
  package: Number,
  offerDate: Date,
  // Parent Details
  fatherName: String,
  fatherPhone: String,
  fatherOccupation: String,
  motherName: String,
  motherPhone: String,
  motherOccupation: String,
  guardianPhone: String,
  profileImage: String,
  resume: String
}, {
  timestamps: true
});

// Compound indexes for faster queries
studentSchema.index({ departmentCode: 1, currentYear: 1 });
studentSchema.index({ batch: 1 });

module.exports = mongoose.model('Student', studentSchema);