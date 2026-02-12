import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Phone,
  Home,
  Cake,
  School,
  PersonOutline,
  ContactPhone
} from '@mui/icons-material';

const StudentProfile = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // For students, they can only view their own profile
      const response = await axios.get(`/api/semesters/student/${user.id}`);
      setStudentData(response.data.student);
    } catch (error) {
      console.error('Error fetching student data:', error);
      // If semester API fails, use user data from context
      setStudentData(user);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const InfoItem = ({ icon, label, value }) => (
    <Grid item xs={12} sm={6}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            p: 1,
            backgroundColor: '#e8eaf6',
            borderRadius: 2,
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {value || 'Not provided'}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  border: '4px solid white'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {studentData?.name || user?.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  {studentData?.rollNumber || user?.rollNumber}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
                  {studentData?.department} - Year {studentData?.year}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <InfoItem
                icon={<Email color="primary" />}
                label="Email Address"
                value={studentData?.email}
              />
              <InfoItem
                icon={<Phone color="primary" />}
                label="Phone Number"
                value={studentData?.phoneNumber}
              />
              <InfoItem
                icon={<Cake color="primary" />}
                label="Date of Birth"
                value={studentData?.dateOfBirth 
                  ? new Date(studentData.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Not provided'
                }
              />
              <InfoItem
                icon={<PersonOutline color="primary" />}
                label="Gender"
                value={studentData?.gender}
              />
              <InfoItem
                icon={<Home color="primary" />}
                label="Address"
                value={studentData?.address}
              />
            </Grid>
          </Paper>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Academic Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <InfoItem
                icon={<School color="primary" />}
                label="Roll Number"
                value={studentData?.rollNumber}
              />
              <InfoItem
                icon={<School color="primary" />}
                label="Department"
                value={studentData?.department}
              />
              <InfoItem
                icon={<School color="primary" />}
                label="Current Year"
                value={`Year ${studentData?.year}`}
              />
            </Grid>
          </Paper>
        </Grid>

        {/* Parent/Guardian Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Parent/Guardian Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <InfoItem
                icon={<PersonOutline color="primary" />}
                label="Parent/Guardian Name"
                value={studentData?.parentName}
              />
              <InfoItem
                icon={<ContactPhone color="primary" />}
                label="Parent/Guardian Contact"
                value={studentData?.parentContact}
              />
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;