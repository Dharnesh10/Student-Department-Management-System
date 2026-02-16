const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Get all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department statistics
router.get('/:code/stats', auth, async (req, res) => {
  try {
    const { code } = req.params;
    
    const totalStudents = await Student.countDocuments({ departmentCode: code });
    const yearWiseCount = await Student.aggregate([
      { $match: { departmentCode: code } },
      { $group: { _id: '$currentYear', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const avgCGPA = await Student.aggregate([
      { $match: { departmentCode: code } },
      { $group: { _id: null, avgCGPA: { $avg: '$cgpa' } } }
    ]);

    const placementStats = await Student.aggregate([
      { $match: { departmentCode: code, currentYear: 4 } },
      { $group: { _id: '$placementStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      totalStudents,
      yearWiseCount,
      avgCGPA: avgCGPA[0]?.avgCGPA || 0,
      placementStats
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;