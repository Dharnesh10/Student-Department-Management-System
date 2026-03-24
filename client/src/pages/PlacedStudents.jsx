// pages/PlacedStudents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, departmentAPI } from '../services/api';
import {
  Award,
  Users,
  Building,
  TrendingUp,
  Filter,
  Loader2,
  ChevronLeft,
  Download,
  Briefcase,
  X,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  ExternalLink,
  CheckCircle,
  MapPin,
  User
} from 'lucide-react';

const PlacedStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    year: '',
    department: '',
    company: '',
    minPackage: '',
    maxPackage: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);

  // Sample placement proof data structure
  const placementProofs = {
    offerLetter: {
      url: '#',
      type: 'pdf',
      filename: 'offer_letter.pdf'
    },
    companyEmail: {
      from: 'hr@company.com',
      subject: 'Offer of Employment',
      date: '2024-01-15',
      screenshot: '#'
    },
    additionalDocs: [
      {
        name: 'Appointment Letter',
        url: '#',
        type: 'pdf'
      },
      {
        name: 'Welcome Kit',
        url: '#',
        type: 'image'
      }
    ]
  };

  useEffect(() => {
    loadPlacedStudents();
    loadDepartments();
  }, []);

  const loadPlacedStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getPlacedStudents();
      const placedStudents = response.data;
      
      // Add mock placement proof data to each student
      const studentsWithProofs = placedStudents.map(student => ({
        ...student,
        placementProof: {
          offerLetter: {
            url: `/api/students/${student._id}/offer-letter`,
            type: 'pdf',
            filename: `offer_letter_${student.registrationNumber}.pdf`
          },
          companyEmail: {
            from: `hr@${student.companyName?.toLowerCase().replace(/\s+/g, '')}.com` || 'hr@company.com',
            subject: `Offer of Employment - ${student.name}`,
            date: student.offerDate || new Date().toISOString().split('T')[0],
            screenshot: `/api/students/${student._id}/email-screenshot`
          },
          additionalDocs: [
            {
              name: 'Appointment Letter',
              url: `/api/students/${student._id}/appointment-letter`,
              type: 'pdf'
            },
            {
              name: 'Welcome Kit',
              url: `/api/students/${student._id}/welcome-kit`,
              type: 'image'
            }
          ]
        }
      }));
      
      setStudents(studentsWithProofs);
      setFilteredStudents(studentsWithProofs);
      
      calculateStats(studentsWithProofs);
      
      const companies = [...new Set(studentsWithProofs.map(s => s.companyName).filter(Boolean))];
      setUniqueCompanies(companies);
    } catch (error) {
      console.error('Error loading placed students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const calculateStats = (data) => {
    const totalPlaced = data.length;
    const avgPackage = data.reduce((sum, s) => sum + (s.package || 0), 0) / totalPlaced || 0;
    const maxPackage = Math.max(...data.map(s => s.package || 0));
    const yearWise = {};
    const deptWise = {};
    
    data.forEach(student => {
      const year = student.currentYear || 4;
      yearWise[year] = (yearWise[year] || 0) + 1;
      
      const dept = student.department?.name || student.departmentCode || 'Other';
      deptWise[dept] = (deptWise[dept] || 0) + 1;
    });

    setStats({
      totalPlaced,
      avgPackage: avgPackage.toFixed(2),
      maxPackage: maxPackage.toFixed(2),
      yearWise,
      deptWise
    });
  };

  const applyFilters = () => {
    let filtered = [...students];

    if (filters.year) {
      filtered = filtered.filter(s => s.currentYear === parseInt(filters.year));
    }

    if (filters.department) {
      filtered = filtered.filter(s => 
        s.department?.code === filters.department || s.departmentCode === filters.department
      );
    }

    if (filters.company) {
      filtered = filtered.filter(s => 
        s.companyName?.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.minPackage) {
      filtered = filtered.filter(s => (s.package || 0) >= parseFloat(filters.minPackage));
    }

    if (filters.maxPackage) {
      filtered = filtered.filter(s => (s.package || 0) <= parseFloat(filters.maxPackage));
    }

    setFilteredStudents(filtered);
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      department: '',
      company: '',
      minPackage: '',
      maxPackage: ''
    });
    setFilteredStudents(students);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Registration No', 'Department', 'Year', 'Company', 'Package (LPA)', 'Offer Date', 'CGPA'],
      ...filteredStudents.map(student => [
        student.name,
        student.registrationNumber,
        student.department?.name || student.departmentCode,
        student.currentYear,
        student.companyName || 'N/A',
        student.package || 'N/A',
        student.offerDate ? new Date(student.offerDate).toLocaleDateString() : 'N/A',
        student.cgpa?.toFixed(2) || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placed-students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  // Company logo placeholder component
  const CompanyLogo = ({ companyName }) => {
    const getInitials = (name) => {
      return name
        ?.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CO';
    };

    const getLogoColor = (name) => {
      const colors = [
        'from-blue-600 to-indigo-600',
        'from-purple-600 to-pink-600',
        'from-emerald-600 to-teal-600',
        'from-amber-600 to-orange-600',
        'from-rose-600 to-red-600',
        'from-cyan-600 to-blue-600'
      ];
      const index = (name?.length || 0) % colors.length;
      return colors[index];
    };

    return (
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getLogoColor(companyName)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
        {getInitials(companyName)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-down">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-dark-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-dark-900">
              Placed Students
            </h1>
            <p className="text-dark-600 mt-1">
              View and filter students who have been placed
            </p>
          </div>
        </div>
        
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Total Placed</p>
                <p className="text-3xl font-display font-bold text-blue-900">
                  {stats.totalPlaced}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 mb-1">Average Package</p>
                <p className="text-3xl font-display font-bold text-emerald-900">
                  ₹{stats.avgPackage} LPA
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 mb-1">Highest Package</p>
                <p className="text-3xl font-display font-bold text-amber-900">
                  ₹{stats.maxPackage} LPA
                </p>
              </div>
              <Award className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Companies</p>
                <p className="text-3xl font-display font-bold text-purple-900">
                  {uniqueCompanies.length}
                </p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-5 h-5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          
          {showFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-200">
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                placeholder="Search company..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                list="company-list"
              />
              <datalist id="company-list">
                {uniqueCompanies.map(company => (
                  <option key={company} value={company} />
                ))}
              </datalist>
            </div>

            {/* Min Package */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Min Package (LPA)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={filters.minPackage}
                onChange={(e) => setFilters({ ...filters, minPackage: e.target.value })}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
            </div>

            {/* Max Package */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Max Package (LPA)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={filters.maxPackage}
                onChange={(e) => setFilters({ ...filters, maxPackage: e.target.value })}
                placeholder="e.g., 20"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        )}

        {/* Apply Filters Button */}
        {showFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="card animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-dark-900">
            Placed Students ({filteredStudents.length})
          </h2>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <p className="text-dark-500">No placed students found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                onClick={() => handleStudentClick(student)}
                className="block p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-dark-900 group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </h3>
                      <span className="font-mono text-sm text-dark-600 bg-slate-100 px-3 py-1 rounded">
                        {student.registrationNumber}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Placed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-dark-600">
                          <span className="font-medium">Department:</span>{' '}
                          {student.department?.name || student.departmentCode}
                        </p>
                        <p className="text-dark-600">
                          <span className="font-medium">Year:</span> {student.currentYear}
                        </p>
                      </div>

                      <div>
                        <p className="text-dark-600">
                          <span className="font-medium">CGPA:</span>{' '}
                          <span className="text-emerald-600 font-semibold">
                            {student.cgpa?.toFixed(2) || 'N/A'}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-dark-600">
                          <span className="font-medium">Company:</span>{' '}
                          <span className="text-blue-600 font-semibold">
                            {student.companyName || 'N/A'}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-dark-600">
                          <span className="font-medium">Package:</span>{' '}
                          <span className="text-emerald-600 font-semibold">
                            ₹{student.package || 'N/A'} LPA
                          </span>
                        </p>
                        {student.offerDate && (
                          <p className="text-dark-500 text-xs">
                            Offer Date: {new Date(student.offerDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Briefcase className="w-5 h-5 text-dark-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placement Summary Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
              onClick={closeModal}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full animate-slide-up">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-white flex items-center">
                  <Award className="w-6 h-6 mr-2" />
                  Placement Summary - {selectedStudent.name}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                {/* Student Info & Company Logo */}
                <div className="flex items-start space-x-6 mb-8">
                  <CompanyLogo companyName={selectedStudent.companyName} />
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-dark-500">Student Name</p>
                        <p className="font-semibold text-dark-900">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500">Registration No</p>
                        <p className="font-mono text-sm">{selectedStudent.registrationNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500">Department</p>
                        <p className="text-sm">{selectedStudent.department?.name || selectedStudent.departmentCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500">Year</p>
                        <p className="text-sm">Year {selectedStudent.currentYear}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Placement Details */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-dark-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                    Placement Details
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-dark-500">Company Name</p>
                      <p className="font-semibold text-lg text-blue-700">{selectedStudent.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Package</p>
                      <p className="font-semibold text-lg text-emerald-700">₹{selectedStudent.package} LPA</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">Offer Date</p>
                      <p className="font-semibold">{selectedStudent.offerDate ? new Date(selectedStudent.offerDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500">CGPA at Placement</p>
                      <p className="font-semibold text-emerald-600">{selectedStudent.cgpa?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Placement Proofs */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-dark-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Placement Proof Documents
                  </h4>

                  {/* Offer Letter */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-dark-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Offer Letter
                      </h5>
                      <a 
                        href={selectedStudent.placementProof?.offerLetter.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                    
                    {/* Document Preview Placeholder */}
                    <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-200">
                      <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <FileText className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-xs text-dark-600">PDF Document</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-dark-900">{selectedStudent.placementProof?.offerLetter.filename}</p>
                          <p className="text-xs text-dark-500">Click the link above to view the full document</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Email */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-dark-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-purple-600" />
                        Company Email
                      </h5>
                      <a 
                        href={selectedStudent.placementProof?.companyEmail.screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 flex items-center text-sm"
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        View Screenshot
                      </a>
                    </div>

                    {/* Email Preview */}
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {selectedStudent.companyName?.[0] || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-dark-900">{selectedStudent.placementProof?.companyEmail.from}</p>
                          <p className="text-xs text-dark-500">to {selectedStudent.email}</p>
                        </div>
                        <p className="text-xs text-dark-500">{new Date(selectedStudent.placementProof?.companyEmail.date).toLocaleDateString()}</p>
                      </div>
                      <div className="pl-11">
                        <p className="text-sm font-medium text-dark-900 mb-2">{selectedStudent.placementProof?.companyEmail.subject}</p>
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-sm text-dark-600">
                            Dear {selectedStudent.name},<br /><br />
                            We are pleased to inform you that you have been selected for the position at {selectedStudent.companyName}. 
                            Your dedication and skills impressed our hiring team.<br /><br />
                            Please find attached your offer letter for your review. We look forward to having you on board!<br /><br />
                            Best regards,<br />
                            HR Team<br />
                            {selectedStudent.companyName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Documents */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h5 className="font-medium text-dark-900 mb-3 flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-emerald-600" />
                      Additional Documents
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.placementProof?.additionalDocs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {doc.type === 'pdf' ? (
                              <FileText className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-600" />
                            )}
                            <span className="text-sm font-medium text-dark-900">{doc.name}</span>
                          </div>
                          <a 
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-dark-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <Link
                  to={`/student/${selectedStudent._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>View Full Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacedStudents;