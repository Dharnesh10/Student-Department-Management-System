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
  Avatar
} from '@mui/material';
import {
  School,
  Groups,
  Person,
  Class
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/students');
      setStats({
        totalStudents: response.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <Groups />,
      color: '#667eea',
      bgColor: '#e8eaf6'
    },
    {
      title: 'Department',
      value: user?.department,
      icon: <School />,
      color: '#26c6da',
      bgColor: '#e0f7fa'
    },
    {
      title: 'Year',
      value: `Year ${user?.year}`,
      icon: <Class />,
      color: '#ab47bc',
      bgColor: '#f3e5f5'
    },
    {
      title: 'Role',
      value: 'Mentor',
      icon: <Person />,
      color: '#66bb6a',
      bgColor: '#e8f5e9'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Dashboard Overview
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You are managing students from <strong>{user?.department}</strong> department, <strong>Year {user?.year}</strong>.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
          Use the sidebar to navigate through different sections and manage student records efficiently.
        </Typography>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • View all students in your department and year
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Add new student records
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Update existing student information
              </Typography>
              <Typography variant="body2">
                • Delete student records when needed
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="secondary">
              Important Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • All changes are saved automatically
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • You can only manage students from your assigned year
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Student data is secure and confidential
              </Typography>
              <Typography variant="body2">
                • Contact admin for any technical issues
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;