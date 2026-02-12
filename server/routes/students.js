import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateMentor } from '../middleware/middleware.js';

const router = express.Router();

// Get all students (mentor can only see their dept and year)
router.get('/', authenticateMentor, async (req, res) => {
  try {
    const { department, year } = req.user;

    const students = await User.find({
      role: 'student',
      department: department,
      year: year
    }).select('-password');

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single student
router.get('/:id', authenticateMentor, async (req, res) => {
  try {
    const { department, year } = req.user;
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      department: department,
      year: year
    }).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new student
router.post('/', authenticateMentor, async (req, res) => {
  try {
    const { department, year } = req.user;
    const {
      name,
      email,
      password,
      rollNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      parentName,
      parentContact
    } = req.body;

    // Check if student already exists
    const existingStudent = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or roll number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student (must be in mentor's dept and year)
    const student = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      department,
      year,
      rollNumber,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      parentName,
      parentContact
    });

    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json(studentResponse);
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', authenticateMentor, async (req, res) => {
  try {
    const { department, year } = req.user;
    const {
      name,
      email,
      phoneNumber,
      address,
      dateOfBirth,
      gender,
      parentName,
      parentContact
    } = req.body;

    // Find student and verify access
    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      department: department,
      year: year
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }

    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.address = address || student.address;
    student.dateOfBirth = dateOfBirth || student.dateOfBirth;
    student.gender = gender || student.gender;
    student.parentName = parentName || student.parentName;
    student.parentContact = parentContact || student.parentContact;

    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json(studentResponse);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/:id', authenticateMentor, async (req, res) => {
  try {
    const { department, year } = req.user;

    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'student',
      department: department,
      year: year
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;