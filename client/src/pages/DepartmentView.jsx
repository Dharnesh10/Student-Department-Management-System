import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { departmentAPI, studentAPI } from '../services/api';
import { 
  Users, 
  TrendingUp, 
  Award,
  ChevronLeft,
  Loader2,
  Search,
  ArrowUpDown
} from 'lucide-react';

const DepartmentView = () => {
  const { code } = useParams();
  const [department, setDepartment] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registrationNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartmentData();
  }, [code]);

  useEffect(() => {
    if (code && selectedYear) {
      loadStudents();
    }
  }, [code, selectedYear, sortBy, sortOrder]);

  const loadDepartmentData = async () => {
    try {
      const [deptsRes, statsRes] = await Promise.all([
        departmentAPI.getAll(),
        departmentAPI.getStats(code)
      ]);

      const dept = deptsRes.data.find(d => d.code === code);
      setDepartment(dept);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading department data:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getByDeptAndYear(code, selectedYear);
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'name' || sortBy === 'registrationNumber') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 animate-slide-down">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-dark-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold px-4 py-2 rounded-lg">
                {department.code}
              </div>
              <h1 className="text-3xl font-display font-bold text-dark-900">
                {department.name}
              </h1>
            </div>
            <p className="text-dark-600">{department.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Total Students</p>
                <p className="text-3xl font-display font-bold text-dark-900">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">Average CGPA</p>
                <p className="text-3xl font-display font-bold text-emerald-600">
                  {stats?.avgCGPA?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-600 mb-1">HOD</p>
                <p className="text-lg font-semibold text-dark-900">
                  {department.hodName}
                </p>
              </div>
              <Award className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Year Tabs */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-dark-900">
              Students by Year
            </h2>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedYear === year
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-dark-600 hover:bg-slate-200'
                  }`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, registration number, or email..."
                className="input-field pl-11"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="registrationNumber">Registration Number</option>
                <option value="name">Name</option>
                <option value="cgpa">CGPA</option>
                <option value="attendance">Attendance</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 rounded-lg border-2 border-slate-200 hover:bg-slate-50"
              >
                <ArrowUpDown className="w-5 h-5 text-dark-600" />
              </button>
            </div>
          </div>

          {/* Students List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark-500">No students found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedStudents.map((student) => (
                <Link
                  key={student._id}
                  to={`/student/${student._id}`}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-lg text-dark-900 group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </h3>
                        <span className="font-mono text-sm text-dark-600 bg-slate-100 px-3 py-1 rounded">
                          {student.registrationNumber}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-dark-600">
                        <span>{student.email}</span>
                        <span>Semester {student.currentSemester}</span>
                        <span className="font-medium text-emerald-600">
                          CGPA: {student.cgpa.toFixed(2)}
                        </span>
                        <span className={`${student.attendance >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Attendance: {student.attendance}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        student.status === 'Active' ? 'badge-success' : 
                        student.status === 'Graduated' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-sm text-dark-600 text-center">
            Showing {sortedStudents.length} of {students.length} students
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentView;