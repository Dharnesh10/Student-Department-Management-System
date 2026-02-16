const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const Department = require('../models/Department');
const Student = require('../models/Student');

dotenv.config();

const departments = [
  {
    name: 'Computer Science and Engineering',
    code: 'CS',
    designation: '1', // Last digit: 1 for CS/EE/ME
    hodName: 'Dr. Rajesh Kumar',
    hodEmail: 'rajesh.kumar@bitsathy.ac.in',
    description: 'Leading department in software development and AI research'
  },
  {
    name: 'Information Technology',
    code: 'IT',
    designation: '2', // Last digit: 2 for IT/CB
    hodName: 'Dr. Priya Sharma',
    hodEmail: 'priya.sharma@bitsathy.ac.in',
    description: 'Focused on networking, cybersecurity and web technologies'
  },
  {
    name: 'Computer Science and Business Systems',
    code: 'CB',
    designation: '2', // Last digit: 2 for IT/CB
    hodName: 'Dr. Chandru K S',
    hodEmail: 'chandru.ks@bitsathy.ac.in',
    description: 'Blend of computer science and business analytics'
  },
  {
    name: 'Electrical and Electronics Engineering',
    code: 'EE',
    designation: '1', // Last digit: 1 for CS/EE/ME
    hodName: 'Dr. Venkatesh Iyer',
    hodEmail: 'venkatesh.iyer@bitsathy.ac.in',
    description: 'Excellence in power systems and embedded systems'
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    designation: '1', // Last digit: 1 for CS/EE/ME
    hodName: 'Dr. Anitha Reddy',
    hodEmail: 'anitha.reddy@bitsathy.ac.in',
    description: 'Innovation in manufacturing and automotive engineering'
  }
];

function generateUniqueEmail(firstName, year, deptCode, globalUsedEmails) {
  const cleanName = firstName.toLowerCase().replace(/\s+/g, '');
  const yearSuffix = String(year).slice(-2);
  let email = `${cleanName}.${deptCode.toLowerCase()}${yearSuffix}@bitsathy.ac.in`;
  
  let counter = 1;
  while (globalUsedEmails.has(email)) {
    email = `${cleanName}${counter}.${deptCode.toLowerCase()}${yearSuffix}@bitsathy.ac.in`;
    counter++;
  }
  
  globalUsedEmails.add(email);
  return email;
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dept_management');
    console.log('Connected to MongoDB');

    await Admin.deleteMany({});
    await Department.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing data');

    const admin = await Admin.create({
      email: 'admin@bitsathy.ac.in',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin'
    });
    console.log('Admin created:', admin.email);

    const createdDepts = await Department.insertMany(departments);
    console.log(`Created ${createdDepts.length} departments`);

    const allStudents = [];
    const globalUsedEmails = new Set();
    let studentCounter = 101; // Start from 101 for each year-dept combo

    const names = [
      'Aarav Kumar', 'Vivaan Sharma', 'Aditya Patel', 'Vihaan Singh', 'Arjun Reddy',
      'Aadhya Nair', 'Saanvi Iyer', 'Ananya Krishnan', 'Diya Mehta', 'Ishita Gupta',
      'Rohan Verma', 'Karan Joshi', 'Rahul Rao', 'Varun Das', 'Vikram Pandey',
      'Kavya Mishra', 'Riya Agarwal', 'Sara Jain', 'Meera Pillai', 'Priya Menon',
      'Nikhil Kumar', 'Aakash Sharma', 'Pranav Patel', 'Siddharth Singh', 'Sai Reddy',
      'Krishna Nair', 'Dhruv Iyer', 'Reyansh Krishnan', 'Ayaan Mehta', 'Tanvi Gupta'
    ];

    let nameIndex = 0;

    // Year 1 = 2024 joining (current first years)
    // Year 2 = 2023 joining
    // Year 3 = 2022 joining  
    // Year 4 = 2021 joining

    for (const dept of createdDepts) {
      for (let year = 1; year <= 4; year++) {
        const yearOfJoining = 2025 - year; // Year 1 → 2024, Year 2 → 2023, Year 3 → 2022, Year 4 → 2021
        const batch = `${yearOfJoining}-${yearOfJoining + 4}`;
        const currentSemester = (year - 1) * 2 + (Math.random() > 0.5 ? 1 : 2);
        
        // Reset student counter for each year-dept combination
        studentCounter = 101;

        for (let i = 0; i < 5; i++) {
          const rollNo = String(studentCounter).padStart(3, '0');
          
          // Format: 7376 + YY (year) + D (designation) + DEPTCODE + NNN (number)
          // Example: 7376241CS101 (2024 joining, designation 1, CS dept, student 101)
          const yearPrefix = String(yearOfJoining).slice(-2); // 21, 22, 23, 24
          const regNo = `7376${yearPrefix}${dept.designation}${dept.code}${rollNo}`;
          
          const fullName = names[nameIndex % names.length];
          const [firstName] = fullName.split(' ');
          nameIndex++;

          const email = generateUniqueEmail(firstName, yearOfJoining, dept.code, globalUsedEmails);

          // Generate semester results
          const semesterResults = [];
          for (let sem = 1; sem <= currentSemester; sem++) {
            const grades = ['O', 'A+', 'A', 'B+', 'B', 'C'];
            const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5 };
            const courses = [
              { courseCode: `22${dept.code}${sem}01`, courseName: 'Course ' + sem + '.1', credits: 4, grade: grades[Math.floor(Math.random() * grades.length)] },
              { courseCode: `22${dept.code}${sem}02`, courseName: 'Course ' + sem + '.2', credits: 4, grade: grades[Math.floor(Math.random() * grades.length)] },
              { courseCode: `22${dept.code}${sem}03`, courseName: 'Course ' + sem + '.3', credits: 3, grade: grades[Math.floor(Math.random() * grades.length)] },
              { courseCode: `22${dept.code}${sem}04`, courseName: 'Course ' + sem + '.4', credits: 3, grade: grades[Math.floor(Math.random() * grades.length)] },
              { courseCode: `22${dept.code}${sem}05`, courseName: 'Course ' + sem + '.5', credits: 3, grade: grades[Math.floor(Math.random() * grades.length)] },
            ];
            
            courses.forEach(c => c.gradePoint = gradePoints[c.grade]);
            const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
            const totalPoints = courses.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
            const sgpa = parseFloat((totalPoints / totalCredits).toFixed(2));

            semesterResults.push({ semester: sem, courses, sgpa, totalCredits });
          }

          const cgpa = semesterResults.length > 0
            ? parseFloat((semesterResults.reduce((sum, r) => sum + r.sgpa, 0) / semesterResults.length).toFixed(2))
            : 0;

          allStudents.push({
            registrationNumber: regNo,
            name: fullName,
            email: email,
            phone: `${7 + Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 1000000000)}`,
            dateOfBirth: new Date(2002 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
            address: {
              street: `${Math.floor(Math.random() * 200) + 1} Main Street`,
              city: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'][Math.floor(Math.random() * 5)],
              state: 'Tamil Nadu',
              pincode: `6${Math.floor(Math.random() * 100000)}`.padStart(6, '0')
            },
            department: dept._id,
            departmentCode: dept.code,
            batch,
            yearOfJoining,
            currentYear: year,
            currentSemester,
            status: 'Active',
            mentorName: dept.hodName,
            mentorId: dept.code + '001',
            specialization: dept.code === 'CS' ? ['AI/ML', 'Cloud Computing', 'Cyber Security'][Math.floor(Math.random() * 3)] : 
                           dept.code === 'CB' ? 'Business Analytics' : null,
            semesterResults,
            cgpa,
            arrears: Math.floor(Math.random() * 3),
            extraCurricular: [
              {
                activityName: ['Hackathon', 'Paper Presentation', 'Sports Event', 'Cultural Fest'][Math.floor(Math.random() * 4)],
                category: ['Technical', 'Sports', 'Cultural'][Math.floor(Math.random() * 3)],
                level: ['College', 'University', 'State', 'National'][Math.floor(Math.random() * 4)],
                position: ['Winner', 'Runner-up', 'Participant', '1st Place', '2nd Place'][Math.floor(Math.random() * 5)],
                date: new Date(yearOfJoining + Math.floor(Math.random() * year), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                description: 'Participated and performed well'
              },
              {
                activityName: ['NSS Volunteer', 'Coding Competition', 'Project Exhibition'][Math.floor(Math.random() * 3)],
                category: ['Social Service', 'Technical', 'Technical'][Math.floor(Math.random() * 3)],
                level: ['College', 'State'][Math.floor(Math.random() * 2)],
                position: 'Participant',
                date: new Date(yearOfJoining + Math.floor(Math.random() * year), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                description: 'Active participation'
              }
            ],
            attendance: 75 + Math.floor(Math.random() * 25),
            skills: [
              { skillName: ['Python', 'Java', 'JavaScript', 'C++'][Math.floor(Math.random() * 4)], proficiency: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)] },
              { skillName: ['React', 'Node.js', 'MongoDB', 'SQL'][Math.floor(Math.random() * 4)], proficiency: ['Beginner', 'Intermediate'][Math.floor(Math.random() * 2)] },
              { skillName: ['Machine Learning', 'Cloud Computing', 'Data Structures'][Math.floor(Math.random() * 3)], proficiency: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)] }
            ],
            certifications: [
              {
                name: ['AWS Certified', 'Azure Fundamentals', 'Google Cloud Associate', 'Oracle Java'][Math.floor(Math.random() * 4)],
                issuedBy: ['Amazon', 'Microsoft', 'Google', 'Oracle'][Math.floor(Math.random() * 4)],
                issuedDate: new Date(yearOfJoining + 1, Math.floor(Math.random() * 12), 1),
                credentialId: `CERT-${Math.floor(Math.random() * 100000)}`
              }
            ],
            placementStatus: year === 4 && Math.random() > 0.4 ? 'Placed' : 'Not Placed',
            companyName: year === 4 && Math.random() > 0.4 ? ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google', 'Amazon', 'Microsoft'][Math.floor(Math.random() * 8)] : null,
            package: year === 4 && Math.random() > 0.4 ? 350000 + Math.floor(Math.random() * 850000) : null,
            fatherName: 'Father ' + fullName.split(' ')[1],
            fatherPhone: `${7 + Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 1000000000)}`,
            fatherOccupation: ['Engineer', 'Doctor', 'Businessman', 'Teacher', 'Farmer'][Math.floor(Math.random() * 5)],
            motherName: 'Mother ' + fullName.split(' ')[1],
            motherPhone: `${7 + Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 1000000000)}`,
            motherOccupation: ['Homemaker', 'Teacher', 'Nurse', 'Businesswoman', 'Doctor'][Math.floor(Math.random() * 5)],
            guardianPhone: `${7 + Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 1000000000)}`
          });
          
          studentCounter++;
        }
      }
    }

    await Student.insertMany(allStudents);
    console.log(`Created ${allStudents.length} students`);

    // Update department counts
    for (const dept of createdDepts) {
      const count = await Student.countDocuments({ department: dept._id });
      await Department.findByIdAndUpdate(dept._id, { totalStudents: count });
    }

    console.log('\n=== Seeding Complete ===');
    console.log('Login Credentials:');
    console.log('Email: admin@bitsathy.ac.in');
    console.log('Password: admin123');
    console.log('\n📋 Sample Registration Numbers:');
    console.log('Year 1 (2024): 7376241CS101 (CS), 7376242IT101 (IT), 7376242CB101 (CB)');
    console.log('Year 2 (2023): 7376231CS101 (CS), 7376232IT101 (IT), 7376232CB101 (CB)');
    console.log('Year 3 (2022): 7376221CS101 (CS), 7376222IT101 (IT), 7376222CB101 (CB)');
    console.log('Year 4 (2021): 7376211CS101 (CS), 7376212IT101 (IT), 7376212CB101 (CB)');
    console.log('\n✅ Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();