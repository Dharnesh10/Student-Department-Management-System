const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// Get all students with filters and search
router.get('/', auth, async (req, res) => {
  try {
    const { 
      year, 
      department, 
      search, 
      sortBy = 'registrationNumber', 
      order = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};
    
    if (year) query.currentYear = parseInt(year);
    if (department) query.departmentCode = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get all unique skills and certifications (helper endpoint for filter dropdowns)
router.get('/filter-options', auth, async (req, res) => {
  try {
    const students = await Student.find({}, 'skills certifications');
    
    const uniqueSkills = new Set();
    const uniqueCerts = new Set();
    
    students.forEach(student => {
      if (student.skills && student.skills.length) {
        student.skills.forEach(skill => {
          if (skill.skillName) uniqueSkills.add(skill.skillName);
        });
      }
      if (student.certifications && student.certifications.length) {
        student.certifications.forEach(cert => {
          if (cert.name) uniqueCerts.add(cert.name);
        });
      }
    });

    res.json({
      skills: Array.from(uniqueSkills).sort(),
      certifications: Array.from(uniqueCerts).sort()
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all placed students with filters
router.get('/placed', auth, async (req, res) => {
  try {
    const {
      year,
      department,
      company,
      minPackage,
      maxPackage,
      sortBy = 'package',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      placementStatus: 'Placed',
      companyName: { $exists: true, $ne: null }
    };

    if (year) query.currentYear = parseInt(year);
    if (department) query.departmentCode = department.toUpperCase();
    if (company) query.companyName = { $regex: company, $options: 'i' };
    
    if (minPackage || maxPackage) {
      query.package = {};
      if (minPackage) query.package.$gte = parseFloat(minPackage);
      if (maxPackage) query.package.$lte = parseFloat(maxPackage);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort(sortOptions);

    res.json(students);
  } catch (error) {
    console.error('Error fetching placed students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department', 'name code designation');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by registration number
router.get('/regno/:regNo', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ 
      registrationNumber: req.params.regNo.toUpperCase() 
    }).populate('department', 'name code designation');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students by department and year
router.get('/filter/:departmentCode/:year', auth, async (req, res) => {
  try {
    const { departmentCode, year } = req.params;
    const students = await Student.find({
      departmentCode: departmentCode.toUpperCase(),
      currentYear: parseInt(year)
    })
    .populate('department', 'name code')
    .sort({ registrationNumber: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top performers
router.get('/analytics/top-performers', auth, async (req, res) => {
  try {
    const { department, year, limit = 10 } = req.query;
    const query = { cgpa: { $gt: 0 } };
    
    if (department) query.departmentCode = department;
    if (year) query.currentYear = parseInt(year);

    const toppers = await Student.find(query)
      .populate('department', 'name code')
      .sort({ cgpa: -1 })
      .limit(parseInt(limit));

    res.json(toppers);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get placement statistics
router.get('/analytics/placements', auth, async (req, res) => {
  try {
    const { department } = req.query;
    const query = { currentYear: 4 };
    
    if (department) query.departmentCode = department;

    const placements = await Student.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$placementStatus',
          count: { $sum: 1 },
          avgPackage: { $avg: '$package' }
        }
      }
    ]);

    const topPlacements = await Student.find({
      ...query,
      placementStatus: 'Placed',
      package: { $exists: true }
    })
    .populate('department', 'name code')
    .sort({ package: -1 })
    .limit(10);

    res.json({
      statistics: placements,
      topPlacements
    });
  } catch (error) {
    console.error('Error fetching placement stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard statistics
router.get('/analytics/dashboard', auth, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    const yearWise = await Student.aggregate([
      { $group: { _id: '$currentYear', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const deptWise = await Student.aggregate([
      { 
        $group: { 
          _id: '$departmentCode', 
          count: { $sum: 1 },
          avgCGPA: { $avg: '$cgpa' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    const avgCGPA = await Student.aggregate([
      { $group: { _id: null, avgCGPA: { $avg: '$cgpa' } } }
    ]);

    const placedStudents = await Student.countDocuments({ 
      placementStatus: 'Placed' 
    });

    res.json({
      totalStudents,
      yearWise,
      deptWise,
      avgCGPA: avgCGPA[0]?.avgCGPA || 0,
      placedStudents
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new route after your existing routes
// GET /api/students/filter/placements - Smart filter for placements

// Filter students for placements (smart filter)
router.get('/filter/placements', auth, async (req, res) => {
  try {
    const {
      year,
      minCGPA,
      maxCGPA,
      maxArrears,
      skills,
      certifications,
      department,
      placementStatus,
      page = 1,
      limit = 50,
      sortBy = 'cgpa',
      sortOrder = 'desc'
    } = req.query;

    // Build the query object
    let query = {};

    // Year filter
    if (year) {
      query.currentYear = parseInt(year);
    }

    // Department filter (by department code)
    if (department) {
      query.departmentCode = department.toUpperCase();
    }

    // Placement status filter
    if (placementStatus && placementStatus !== '') {
      query.placementStatus = placementStatus;
    }

    // CGPA range filter
    if (minCGPA || maxCGPA) {
      query.cgpa = {};
      if (minCGPA) query.cgpa.$gte = parseFloat(minCGPA);
      if (maxCGPA) query.cgpa.$lte = parseFloat(maxCGPA);
    }

    // Arrears filter
    if (maxArrears && maxArrears !== '') {
      query.arrears = { $lte: parseInt(maxArrears) };
    }

    // Skills filter (search in skills array)
    if (skills) {
      const skillList = skills.split(',');
      query['skills.skillName'] = { 
        $in: skillList.map(skill => new RegExp(skill.trim(), 'i')) 
      };
    }

    // Certifications filter (search in certifications array)
    if (certifications) {
      const certList = certifications.split(',');
      query['certifications.name'] = { 
        $in: certList.map(cert => new RegExp(cert.trim(), 'i')) 
      };
    }

    // Search functionality (optional, can be added if needed)
    const { search } = req.query;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const students = await Student.find(query)
      .populate('department', 'name code designation')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Student.countDocuments(query);

    // Get unique skills and certifications for filter suggestions
    const allStudents = await Student.find({}, 'skills certifications');
    
    const uniqueSkills = new Set();
    const uniqueCerts = new Set();
    
    allStudents.forEach(student => {
      if (student.skills && student.skills.length) {
        student.skills.forEach(skill => {
          if (skill.skillName) uniqueSkills.add(skill.skillName);
        });
      }
      if (student.certifications && student.certifications.length) {
        student.certifications.forEach(cert => {
          if (cert.name) uniqueCerts.add(cert.name);
        });
      }
    });

    res.json({
      students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      filterOptions: {
        skills: Array.from(uniqueSkills).sort(),
        certifications: Array.from(uniqueCerts).sort()
      }
    });

  } catch (error) {
    console.error('Error in smart filter:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;