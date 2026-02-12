import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create mentors for CSE department (4 mentors for years 1-4)
    const mentors = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.cse1@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'CSE',
        year: 1
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.cse2@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'CSE',
        year: 2
      },
      {
        name: 'Dr. Amit Patel',
        email: 'amit.cse3@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'CSE',
        year: 3
      },
      {
        name: 'Dr. Sneha Reddy',
        email: 'sneha.cse4@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'CSE',
        year: 4
      },
      // ECE department mentors
      {
        name: 'Dr. Vikram Singh',
        email: 'vikram.ece1@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'ECE',
        year: 1
      },
      {
        name: 'Dr. Anjali Gupta',
        email: 'anjali.ece2@college.edu',
        password: hashedPassword,
        role: 'mentor',
        department: 'ECE',
        year: 2
      }
    ];

    // Create sample students for CSE Year 1
    const students = [
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        year: 1,
        rollNumber: 'CSE001',
        phoneNumber: '9876543210',
        gender: 'Male',
        dateOfBirth: new Date('2005-03-15'),
        address: '123 MG Road, Bangalore',
        parentName: 'Mr. Suresh Verma',
        parentContact: '9876543211'
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        year: 1,
        rollNumber: 'CSE002',
        phoneNumber: '9876543212',
        gender: 'Female',
        dateOfBirth: new Date('2005-07-22'),
        address: '456 Brigade Road, Bangalore',
        parentName: 'Mr. Ramesh Iyer',
        parentContact: '9876543213'
      },
      {
        name: 'Karthik Menon',
        email: 'karthik.menon@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        year: 1,
        rollNumber: 'CSE003',
        phoneNumber: '9876543214',
        gender: 'Male',
        dateOfBirth: new Date('2005-05-10'),
        address: '789 Indiranagar, Bangalore',
        parentName: 'Mr. Vijay Menon',
        parentContact: '9876543215'
      },
      // CSE Year 2 students
      {
        name: 'Sneha Kapoor',
        email: 'sneha.kapoor@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        year: 2,
        rollNumber: 'CSE101',
        phoneNumber: '9876543220',
        gender: 'Female',
        dateOfBirth: new Date('2004-04-18'),
        address: '321 Koramangala, Bangalore',
        parentName: 'Mr. Anil Kapoor',
        parentContact: '9876543221'
      },
      {
        name: 'Arjun Nair',
        email: 'arjun.nair@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'CSE',
        year: 2,
        rollNumber: 'CSE102',
        phoneNumber: '9876543222',
        gender: 'Male',
        dateOfBirth: new Date('2004-09-25'),
        address: '654 Whitefield, Bangalore',
        parentName: 'Mr. Sunil Nair',
        parentContact: '9876543223'
      },
      // ECE Year 1 students
      {
        name: 'Meera Krishnan',
        email: 'meera.krishnan@student.edu',
        password: hashedPassword,
        role: 'student',
        department: 'ECE',
        year: 1,
        rollNumber: 'ECE001',
        phoneNumber: '9876543230',
        gender: 'Female',
        dateOfBirth: new Date('2005-06-12'),
        address: '987 Jayanagar, Bangalore',
        parentName: 'Mr. Mohan Krishnan',
        parentContact: '9876543231'
      }
    ];

    await User.insertMany([...mentors, ...students]);
    console.log('Database seeded successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('\nMentors:');
    console.log('CSE Year 1: rajesh.cse1@college.edu / password123');
    console.log('CSE Year 2: priya.cse2@college.edu / password123');
    console.log('CSE Year 3: amit.cse3@college.edu / password123');
    console.log('CSE Year 4: sneha.cse4@college.edu / password123');
    console.log('ECE Year 1: vikram.ece1@college.edu / password123');
    console.log('ECE Year 2: anjali.ece2@college.edu / password123');
    console.log('\nStudents:');
    console.log('All students: password123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();