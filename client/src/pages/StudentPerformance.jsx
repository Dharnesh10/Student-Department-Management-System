import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StudentPerformance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/semesters/analytics/${user.id}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!analytics) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No performance data available yet.
        </Typography>
      </Paper>
    );
  }

  // Prepare grade distribution data for pie chart
  const gradeData = Object.entries(analytics.gradeDistribution)
    .filter(([grade, count]) => count > 0)
    .map(([grade, count]) => ({
      name: `Grade ${grade}`,
      value: count
    }));

  const COLORS = ['#4caf50', '#8bc34a', '#2196f3', '#03a9f4', '#ff9800', '#ff5722', '#f44336', '#e91e63'];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Performance Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Overall CGPA
              </Typography>
              <Typography variant="h2" fontWeight="bold" color="primary">
                {analytics.overallCGPA}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of 10.00
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Credits
              </Typography>
              <Typography variant="h2" fontWeight="bold" color="secondary">
                {analytics.totalCredits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credits Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Subjects Completed
              </Typography>
              <Typography variant="h2" fontWeight="bold" sx={{ color: '#66bb6a' }}>
                {analytics.subjectCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Semester-wise SGPA Line Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Semester-wise Performance Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.semesterWisePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="semester" 
                  label={{ value: 'Semester', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  domain={[0, 10]}
                  label={{ value: 'SGPA', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sgpa" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  name="SGPA"
                  dot={{ fill: '#667eea', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Grade Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Grade Distribution
            </Typography>
            {gradeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" color="text.secondary">
                  No grade data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Semester-wise Credits Bar Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Semester-wise Credits Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.semesterWisePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="semester" 
                  label={{ value: 'Semester', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Credits', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="credits" fill="#764ba2" name="Credits" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Grade Breakdown Table */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              Detailed Grade Breakdown
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(analytics.gradeDistribution).map(([grade, count]) => (
                <Grid item xs={6} sm={4} md={3} key={grade}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Grade {grade}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {analytics.subjectCount > 0 
                          ? `${((count / analytics.subjectCount) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentPerformance;