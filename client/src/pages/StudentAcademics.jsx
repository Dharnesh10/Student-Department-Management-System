import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Schedule
} from '@mui/icons-material';

const StudentAcademics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [academicData, setAcademicData] = useState({
    semesters: [],
    cgpa: 0
  });

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/semesters/student/${user.id}`);
      setAcademicData(response.data);
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'O': 'success',
      'A+': 'success',
      'A': 'primary',
      'B+': 'info',
      'B': 'warning',
      'C': 'warning',
      'P': 'default',
      'F': 'error',
      'Ab': 'error'
    };
    return gradeColors[grade] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Academic Records
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cumulative Grade Point Average
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {academicData.cgpa}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of 10.00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Academic Progress
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="secondary">
                {academicData.semesters.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Semesters Completed/In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {academicData.semesters.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No semester records available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your academic records will appear here once your mentor adds them.
          </Typography>
        </Paper>
      ) : (
        academicData.semesters.map((semester) => (
          <Accordion 
            key={semester._id} 
            elevation={3}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#eeeeee' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                {semester.status === 'Completed' ? (
                  <CheckCircle color="success" />
                ) : (
                  <Schedule color="warning" />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Semester {semester.semesterNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {semester.academicYear || 'Academic Year'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mr: 2 }}>
                  <Chip 
                    label={`SGPA: ${semester.sgpa}`}
                    color={parseFloat(semester.sgpa) >= 8 ? 'success' : parseFloat(semester.sgpa) >= 6 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    Credits: {semester.totalCredits}
                  </Typography>
                </Box>
                <Chip 
                  label={semester.status}
                  size="small"
                  color={semester.status === 'Completed' ? 'success' : 'warning'}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#667eea' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                        Subject Code
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                        Subject Name
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Credits
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Marks
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Grade
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Grade Points
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Type
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {semester.subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No subjects added yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      semester.subjects.map((subject, index) => (
                        <TableRow 
                          key={index}
                          sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                        >
                          <TableCell>{subject.subjectCode}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {subject.subjectName}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{subject.credits}</TableCell>
                          <TableCell align="center">
                            {subject.marks !== undefined && subject.marks !== null ? (
                              <Typography fontWeight="bold">
                                {subject.marks}
                              </Typography>
                            ) : (
                              <Typography color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {subject.grade ? (
                              <Chip 
                                label={subject.grade} 
                                color={getGradeColor(subject.grade)}
                                size="small"
                              />
                            ) : (
                              <Typography color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {subject.gradePoints !== undefined ? (
                              <Typography fontWeight="bold">
                                {subject.gradePoints}
                              </Typography>
                            ) : (
                              <Typography color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={subject.isElective ? 'Elective' : 'Core'}
                              size="small"
                              variant="outlined"
                              color={subject.isElective ? 'secondary' : 'primary'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default StudentAcademics;