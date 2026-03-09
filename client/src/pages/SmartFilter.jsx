// pages/SmartFilter.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, departmentAPI } from '../services/api';
import {
  Filter,
  Search,
  X,
  ChevronLeft,
  Users,
  GraduationCap,
  Award,
  Code,
  BookOpen,
  Loader2,
  ChevronRight,
  Download
} from 'lucide-react';

const SmartFilter = () => {
  const [filters, setFilters] = useState({
    year: '',
    minCGPA: '',
    maxCGPA: '',
    maxArrears: '',
    skills: [],
    certifications: [],
    department: '',
    placementStatus: ''
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCerts, setAvailableCerts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [results, setResults] = useState([]); // This will store the students array
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Fetch departments
      const deptsRes = await departmentAPI.getAll();
      setDepartments(deptsRes.data);

      // Fetch filter options (skills and certifications) from the new endpoint
      const filterOptionsRes = await studentAPI.getFilterOptions();
      setAvailableSkills(filterOptionsRes.data.skills || []);
      setAvailableCerts(filterOptionsRes.data.certifications || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const addSkill = () => {
    if (skillInput && !filters.skills.includes(skillInput)) {
      setFilters({
        ...filters,
        skills: [...filters.skills, skillInput]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter(s => s !== skill)
    });
  };

  const addCertification = () => {
    if (certInput && !filters.certifications.includes(certInput)) {
      setFilters({
        ...filters,
        certifications: [...filters.certifications, certInput]
      });
      setCertInput('');
    }
  };

  const removeCertification = (cert) => {
    setFilters({
      ...filters,
      certifications: filters.certifications.filter(c => c !== cert)
    });
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      minCGPA: '',
      maxCGPA: '',
      maxArrears: '',
      skills: [],
      certifications: [],
      department: '',
      placementStatus: ''
    });
    setResults([]);
    setPagination(null);
    setSearched(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    
    try {
      // Build query parameters
      const params = {};
      
      if (filters.year) params.year = filters.year;
      if (filters.minCGPA) params.minCGPA = filters.minCGPA;
      if (filters.maxCGPA) params.maxCGPA = filters.maxCGPA;
      if (filters.maxArrears) params.maxArrears = filters.maxArrears;
      if (filters.department) params.department = filters.department;
      if (filters.placementStatus) params.placementStatus = filters.placementStatus;
      if (filters.skills.length) params.skills = filters.skills.join(',');
      if (filters.certifications.length) params.certifications = filters.certifications.join(',');

      const response = await studentAPI.filterForPlacements(params);
      
      // The response from backend has { students, pagination, filterOptions }
      setResults(response.data.students || []);
      setPagination(response.data.pagination || null);
      
      // Update available skills/certs if provided
      if (response.data.filterOptions) {
        if (response.data.filterOptions.skills) {
          setAvailableSkills(response.data.filterOptions.skills);
        }
        if (response.data.filterOptions.certifications) {
          setAvailableCerts(response.data.filterOptions.certifications);
        }
      }
    } catch (error) {
      console.error('Error filtering students:', error);
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results.length) return;
    
    const csvContent = [
      ['Name', 'Registration No', 'Department', 'Year', 'CGPA', 'Arrears', 'Skills', 'Certifications', 'Placement Status'],
      ...results.map(student => [
        student.name,
        student.registrationNumber,
        student.department?.name || student.departmentCode || '',
        student.currentYear,
        student.cgpa?.toFixed(2) || '0.00',
        student.arrears || 0,
        student.skills?.map(s => s.skillName).join('; ') || '',
        student.certifications?.map(c => c.name).join('; ') || '',
        student.placementStatus || 'Not Placed'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement-eligible-students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
          <div>
            <h1 className="text-3xl font-display font-bold text-dark-900">
              Smart Filter for Placements
            </h1>
            <p className="text-dark-600 mt-1">
              Filter students based on academic performance, skills, and certifications
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card animate-slide-up">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-display font-bold text-dark-900">
              Filter Criteria
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Placement Status */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Placement Status
              </label>
              <select
                value={filters.placementStatus}
                onChange={(e) => setFilters({ ...filters, placementStatus: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="">All Status</option>
                <option value="Not Placed">Not Placed</option>
                <option value="Placed">Placed</option>
                <option value="Higher Studies">Higher Studies</option>
                <option value="Entrepreneur">Entrepreneur</option>
              </select>
            </div>

            {/* CGPA Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark-700">
                CGPA Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={filters.minCGPA}
                  onChange={(e) => setFilters({ ...filters, minCGPA: e.target.value })}
                  placeholder="Min"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <span className="text-dark-400">to</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={filters.maxCGPA}
                  onChange={(e) => setFilters({ ...filters, maxCGPA: e.target.value })}
                  placeholder="Max"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            {/* Max Arrears */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Maximum Arrears
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxArrears}
                onChange={(e) => setFilters({ ...filters, maxArrears: e.target.value })}
                placeholder="Enter max number of arrears"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {/* Skills */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Technical Skills
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Type a skill and press Enter or Add"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  list="skills-list"
                />
                <datalist id="skills-list">
                  {availableSkills.map(skill => (
                    <option key={skill} value={skill} />
                  ))}
                </datalist>
                <button
                  onClick={addSkill}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    <Code className="w-3 h-3" />
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Certifications
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  placeholder="Type a certification and press Enter or Add"
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  list="certs-list"
                />
                <datalist id="certs-list">
                  {availableCerts.map(cert => (
                    <option key={cert} value={cert} />
                  ))}
                </datalist>
                <button
                  onClick={addCertification}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.certifications.map(cert => (
                  <span
                    key={cert}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full"
                  >
                    <Award className="w-3 h-3" />
                    <span>{cert}</span>
                    <button
                      onClick={() => removeCertification(cert)}
                      className="ml-1 hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={clearFilters}
              className="px-6 py-2 rounded-lg font-medium text-dark-600 hover:bg-slate-100 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span>Search Students</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-display font-bold text-dark-900">
                  Search Results
                </h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {results.length} students found
                  {pagination && pagination.total > results.length && ` (of ${pagination.total} total)`}
                </span>
              </div>
              
              {results.length > 0 && (
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-dark-500">No students match the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((student) => (
                  <Link
                    key={student._id}
                    to={`/student/${student._id}`}
                    className="block p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
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
                          <span className={`badge ${
                            student.placementStatus === 'Placed' ? 'badge-success' :
                            student.placementStatus === 'Higher Studies' ? 'badge-info' :
                            student.placementStatus === 'Entrepreneur' ? 'badge-warning' : 
                            'badge-secondary'
                          }`}>
                            {student.placementStatus || 'Not Placed'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-dark-600">
                              <span className="font-medium">Department:</span> {student.department?.name || student.departmentCode}
                            </p>
                            <p className="text-dark-600">
                              <span className="font-medium">Year:</span> {student.currentYear}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark-600">
                              <span className="font-medium">CGPA:</span> 
                              <span className="ml-1 font-semibold text-emerald-600">{student.cgpa?.toFixed(2) || '0.00'}</span>
                            </p>
                            <p className="text-dark-600">
                              <span className="font-medium">Arrears:</span> {student.arrears || 0}
                            </p>
                          </div>
                          <div>
                            <div className="flex flex-wrap gap-1">
                              {student.skills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {skill.skillName}
                                </span>
                              ))}
                              {student.skills?.length > 3 && (
                                <span className="text-xs text-dark-500">+{student.skills.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Pagination Info */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6 text-sm text-dark-600 text-center">
                Page {pagination.page} of {pagination.pages}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFilter;