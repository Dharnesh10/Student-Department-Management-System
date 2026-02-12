import express from 'express';
import Semester from '../models/Semester.js';
import User from '../models/User.js';
import { authenticateMentor, authenticateToken } from '../middleware/middleware.js';

const router = express.Router();

// Get all semesters for a student (Mentor or Student can access)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user is the student themselves or a mentor of the same dept/year
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Authorization check
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (req.user.role === 'mentor') {
      if (req.user.department !== student.department || req.user.year !== student.year) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const semesters = await Semester.find({ studentId }).sort({ semesterNumber: 1 });
    
    // Calculate CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    semesters.forEach(sem => {
      totalGradePoints += parseFloat(sem.sgpa) * sem.totalCredits;
      totalCredits += sem.totalCredits;
    });
    
    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    
    res.json({ semesters, cgpa, student });
  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single semester
router.get('/:semesterId', authenticateToken, async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.semesterId).populate('studentId', 'name rollNumber');
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    res.json(semester);
  } catch (error) {
    console.error('Get semester error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new semester (Mentor only)
router.post('/', authenticateMentor, async (req, res) => {
  try {
    const { studentId, semesterNumber, subjects, academicYear } = req.body;
    
    // Verify student belongs to mentor's dept and year
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (req.user.department !== student.department || req.user.year !== student.year) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if semester already exists
    const existingSemester = await Semester.findOne({ studentId, semesterNumber });
    if (existingSemester) {
      return res.status(400).json({ message: 'Semester already exists for this student' });
    }
    
    const semester = new Semester({
      studentId,
      semesterNumber,
      subjects: subjects || [],
      academicYear
    });
    
    await semester.save();
    res.status(201).json(semester);
  } catch (error) {
    console.error('Create semester error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update semester marks (Mentor only)
router.put('/:semesterId', authenticateMentor, async (req, res) => {
  try {
    const { subjects, status } = req.body;
    
    const semester = await Semester.findById(req.params.semesterId).populate('studentId');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // Verify access
    if (req.user.department !== semester.studentId.department || 
        req.user.year !== semester.studentId.year) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (subjects) semester.subjects = subjects;
    if (status) semester.status = status;
    
    await semester.save();
    res.json(semester);
  } catch (error) {
    console.error('Update semester error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add subject to semester (Mentor only)
router.post('/:semesterId/subjects', authenticateMentor, async (req, res) => {
  try {
    const { subjectCode, subjectName, credits, isElective } = req.body;
    
    const semester = await Semester.findById(req.params.semesterId).populate('studentId');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // Verify access
    if (req.user.department !== semester.studentId.department || 
        req.user.year !== semester.studentId.year) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    semester.subjects.push({
      subjectCode,
      subjectName,
      credits: credits || 3,
      isElective: isElective || false
    });
    
    await semester.save();
    res.json(semester);
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete semester (Mentor only)
router.delete('/:semesterId', authenticateMentor, async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.semesterId).populate('studentId');
    
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // Verify access
    if (req.user.department !== semester.studentId.department || 
        req.user.year !== semester.studentId.year) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Semester.findByIdAndDelete(req.params.semesterId);
    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Delete semester error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get performance analytics for a student
router.get('/analytics/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Authorization check
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const semesters = await Semester.find({ studentId }).sort({ semesterNumber: 1 });
    
    // Calculate analytics
    const analytics = {
      semesterWisePerformance: [],
      overallCGPA: 0,
      totalCredits: 0,
      gradeDistribution: {
        O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, P: 0, F: 0
      },
      subjectCount: 0
    };
    
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    semesters.forEach(sem => {
      analytics.semesterWisePerformance.push({
        semester: sem.semesterNumber,
        sgpa: parseFloat(sem.sgpa),
        credits: sem.totalCredits
      });
      
      totalGradePoints += parseFloat(sem.sgpa) * sem.totalCredits;
      totalCredits += sem.totalCredits;
      
      // Grade distribution
      sem.subjects.forEach(subject => {
        if (subject.grade) {
          analytics.gradeDistribution[subject.grade]++;
          analytics.subjectCount++;
        }
      });
    });
    
    analytics.overallCGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    analytics.totalCredits = totalCredits;
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;