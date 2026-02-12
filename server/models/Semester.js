import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    default: 3
  },
  marks: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'Ab']
  },
  gradePoints: {
    type: Number
  },
  isElective: {
    type: Boolean,
    default: false
  }
});

const semesterSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  subjects: [subjectSchema],
  sgpa: {
    type: Number,
    default: 0
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress'
  },
  academicYear: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate SGPA before saving
semesterSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    this.subjects.forEach(subject => {
      if (subject.marks !== undefined && subject.marks !== null) {
        // Calculate grade and grade points based on marks
        const { grade, gradePoints } = calculateGrade(subject.marks);
        subject.grade = grade;
        subject.gradePoints = gradePoints;
        
        totalGradePoints += gradePoints * subject.credits;
        totalCredits += subject.credits;
      }
    });
    
    this.totalCredits = totalCredits;
    this.sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  }
  next();
});

// Grade calculation function
function calculateGrade(marks) {
  if (marks >= 90) return { grade: 'O', gradePoints: 10 };
  if (marks >= 80) return { grade: 'A+', gradePoints: 9 };
  if (marks >= 70) return { grade: 'A', gradePoints: 8 };
  if (marks >= 60) return { grade: 'B+', gradePoints: 7 };
  if (marks >= 50) return { grade: 'B', gradePoints: 6 };
  if (marks >= 40) return { grade: 'C', gradePoints: 5 };
  if (marks >= 35) return { grade: 'P', gradePoints: 4 };
  return { grade: 'F', gradePoints: 0 };
}

const Semester = mongoose.model('Semester', semesterSchema);

export default Semester;