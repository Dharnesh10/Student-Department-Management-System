import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  School,
  EmojiEvents,
  Grade,
  TrendingUp
} from '@mui/icons-material';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [academicData, setAcademicData] = useState({
    semesters: [],
    cgpa: 0,
    student: null
  });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      const [semesterResponse, analyticsResponse] = await Promise.all([
        axios.get(`/api/semesters/student/${user.id}`),
        axios.get(`/api/semesters/analytics/${user.id}`)
      ]);
      
      setAcademicData(semesterResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error fetching academic data:', error);
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

  const cgpaPercentage = (parseFloat(academicData.cgpa) / 10) * 100;
  const completedSemesters = academicData.semesters.filter(s => s.status === 'Completed').length;

  const statCards = [
    {
      title: 'Overall CGPA',
      value: academicData.cgpa || '0.00',
      icon: <Grade />,
      color: '#667eea',
      bgColor: '#e8eaf6',
      subtitle: 'Out of 10.00'
    },
    {
      title: 'Completed Semesters',
      value: completedSemesters,
      icon: <School />,
      color: '#26c6da',
      bgColor: '#e0f7fa',
      subtitle: `Total: ${academicData.semesters.length}`
    },
    {
      title: 'Total Credits',
      value: analytics?.totalCredits || 0,
      icon: <EmojiEvents />,
      color: '#ab47bc',
      bgColor: '#f3e5f5',
      subtitle: 'Credits Earned'
    },
    {
      title: 'Subjects Completed',
      value: analytics?.subjectCount || 0,
      icon: <TrendingUp />,
      color: '#66bb6a',
      bgColor: '#e8f5e9',
      subtitle: 'Total Subjects'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={card.color}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              CGPA Progress
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current CGPA
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {academicData.cgpa}/10.00
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={cgpaPercentage} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 5
                  }
                }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {cgpaPercentage >= 80 && "Excellent Performance! Keep it up! 🌟"}
                  {cgpaPercentage >= 60 && cgpaPercentage < 80 && "Good Progress! Aim higher! 📈"}
                  {cgpaPercentage < 60 && "Keep working hard! You can do it! 💪"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Recent Semester Performance
            </Typography>
            {academicData.semesters.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {academicData.semesters.slice(-3).reverse().map((sem, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Semester {sem.semesterNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sem.totalCredits} Credits
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip 
                        label={`SGPA: ${sem.sgpa}`}
                        color={parseFloat(sem.sgpa) >= 8 ? 'success' : parseFloat(sem.sgpa) >= 6 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No semester data available yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Student Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Roll Number
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {user?.rollNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Department
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {user?.department}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Current Year
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Year {user?.year}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                  {user?.email}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;