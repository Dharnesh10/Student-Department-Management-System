import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  Save
} from '@mui/icons-material';

const MentorAcademics = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSemesterDialog, setAddSemesterDialog] = useState(false);
  const [addSubjectDialog, setAddSubjectDialog] = useState(false);
  const [editMarksDialog, setEditMarksDialog] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newSemester, setNewSemester] = useState({
    semesterNumber: '',
    academicYear: '',
    subjects: []
  });

  const [newSubject, setNewSubject] = useState({
    subjectCode: '',
    subjectName: '',
    credits: 3,
    isElective: false
  });

  const [editingSubjects, setEditingSubjects] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSemesters = async (studentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/semesters/student/${studentId}`);
      setSemesters(response.data.semesters);
      setSelectedStudent(response.data.student);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSemester = async () => {
    try {
      const commonSubjects = [
        { subjectCode: 'SUB001', subjectName: 'Subject 1', credits: 3, isElective: false },
        { subjectCode: 'SUB002', subjectName: 'Subject 2', credits: 3, isElective: false },
        { subjectCode: 'SUB003', subjectName: 'Subject 3', credits: 3, isElective: false },
        { subjectCode: 'SUB004', subjectName: 'Subject 4', credits: 3, isElective: false },
        { subjectCode: 'SUB005', subjectName: 'Subject 5', credits: 3, isElective: false }
      ];

      await axios.post('/api/semesters', {
        studentId: selectedStudent._id,
        semesterNumber: newSemester.semesterNumber,
        academicYear: newSemester.academicYear,
        subjects: commonSubjects
      });

      setSuccess('Semester added successfully');
      setAddSemesterDialog(false);
      setNewSemester({ semesterNumber: '', academicYear: '', subjects: [] });
      fetchSemesters(selectedStudent._id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add semester');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddSubject = async () => {
    try {
      await axios.post(`/api/semesters/${selectedSemester._id}/subjects`, newSubject);
      setSuccess('Subject added successfully');
      setAddSubjectDialog(false);
      setNewSubject({ subjectCode: '', subjectName: '', credits: 3, isElective: false });
      fetchSemesters(selectedStudent._id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add subject');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditMarks = (semester) => {
    setSelectedSemester(semester);
    setEditingSubjects(JSON.parse(JSON.stringify(semester.subjects))); // Deep copy
    setEditMarksDialog(true);
  };

  const handleSaveMarks = async () => {
    try {
      await axios.put(`/api/semesters/${selectedSemester._id}`, {
        subjects: editingSubjects
      });
      setSuccess('Marks updated successfully');
      setEditMarksDialog(false);
      fetchSemesters(selectedStudent._id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update marks');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSemester = async (semesterId) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        await axios.delete(`/api/semesters/${semesterId}`);
        setSuccess('Semester deleted successfully');
        fetchSemesters(selectedStudent._id);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete semester');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const updateSubjectMarks = (index, marks) => {
    const updated = [...editingSubjects];
    updated[index].marks = marks ? parseFloat(marks) : null;
    setEditingSubjects(updated);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Academic Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Student Selection */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Student
        </Typography>
        <Grid container spacing={2}>
          {students.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student._id}>
              <Paper
                elevation={selectedStudent?._id === student._id ? 6 : 2}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedStudent?._id === student._id ? '2px solid #667eea' : 'none',
                  '&:hover': { elevation: 4 }
                }}
                onClick={() => fetchSemesters(student._id)}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {student.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.rollNumber}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {selectedStudent && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Semesters for {selectedStudent.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddSemesterDialog(true)}
              sx={{ bgcolor: '#667eea' }}
            >
              Add Semester
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : semesters.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No semesters added yet. Click "Add Semester" to create one.
            </Typography>
          ) : (
            semesters.map((semester) => (
              <Accordion key={semester._id} elevation={2} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Typography variant="h6">
                      Semester {semester.semesterNumber}
                    </Typography>
                    <Chip label={`SGPA: ${semester.sgpa}`} color="primary" />
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMarks(semester);
                      }}
                      size="small"
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSemester(semester);
                        setAddSubjectDialog(true);
                      }}
                      size="small"
                      color="success"
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSemester(semester._id);
                      }}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Code</TableCell>
                          <TableCell>Subject Name</TableCell>
                          <TableCell align="center">Credits</TableCell>
                          <TableCell align="center">Marks</TableCell>
                          <TableCell align="center">Grade</TableCell>
                          <TableCell align="center">Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {semester.subjects.map((subject, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{subject.subjectCode}</TableCell>
                            <TableCell>{subject.subjectName}</TableCell>
                            <TableCell align="center">{subject.credits}</TableCell>
                            <TableCell align="center">
                              {subject.marks !== undefined && subject.marks !== null ? subject.marks : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {subject.grade ? (
                                <Chip label={subject.grade} size="small" color="primary" />
                              ) : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={subject.isElective ? 'Elective' : 'Core'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Paper>
      )}

      {/* Add Semester Dialog */}
      <Dialog open={addSemesterDialog} onClose={() => setAddSemesterDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Semester</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Semester Number"
                value={newSemester.semesterNumber}
                onChange={(e) => setNewSemester({ ...newSemester, semesterNumber: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <MenuItem key={num} value={num}>Semester {num}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Academic Year"
                placeholder="e.g., 2024-2025"
                value={newSemester.academicYear}
                onChange={(e) => setNewSemester({ ...newSemester, academicYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                5 common subjects will be added automatically. You can add elective subjects later.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSemesterDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSemester} variant="contained">Add Semester</Button>
        </DialogActions>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={addSubjectDialog} onClose={() => setAddSubjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Elective Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Code"
                value={newSubject.subjectCode}
                onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Name"
                value={newSubject.subjectName}
                onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Credits"
                value={newSubject.credits}
                onChange={(e) => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Subject Type"
                value={newSubject.isElective}
                onChange={(e) => setNewSubject({ ...newSubject, isElective: e.target.value })}
              >
                <MenuItem value={false}>Core</MenuItem>
                <MenuItem value={true}>Elective</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSubjectDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSubject} variant="contained">Add Subject</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Marks Dialog */}
      <Dialog open={editMarksDialog} onClose={() => setEditMarksDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Marks - Semester {selectedSemester?.semesterNumber}</DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject Code</TableCell>
                  <TableCell>Subject Name</TableCell>
                  <TableCell align="center">Credits</TableCell>
                  <TableCell align="center">Marks (0-100)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editingSubjects.map((subject, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{subject.subjectCode}</TableCell>
                    <TableCell>{subject.subjectName}</TableCell>
                    <TableCell align="center">{subject.credits}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={subject.marks || ''}
                        onChange={(e) => updateSubjectMarks(idx, e.target.value)}
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMarksDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveMarks} variant="contained" startIcon={<Save />}>
            Save Marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorAcademics;