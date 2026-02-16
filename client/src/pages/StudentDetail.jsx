import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../services/api';
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  GraduationCap,
  Award,
  TrendingUp,
  Star,
  Briefcase,
  FileText,
  Users,
  Activity,
  Loader2
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const response = await studentAPI.getById(id);
      setStudent(response.data);
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-dark-500">Student not found</p>
      </div>
    );
  }

  const chartData = {
    labels: student.semesterResults.map(r => `Sem ${r.semester}`),
    datasets: [
      {
        label: 'SGPA',
        data: student.semesterResults.map(r => r.sgpa),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'skills', label: 'Skills & Certs', icon: Award },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 animate-slide-down">
          <Link
            to={`/department/${student.departmentCode}`}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-dark-600" />
          </Link>
          <h1 className="text-3xl font-display font-bold text-dark-900">
            Student Profile
          </h1>
        </div>

        {/* Profile Card */}
        <div className="card animate-scale-in">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {student.name.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-display font-bold text-dark-900">
                  {student.name}
                </h2>
                <p className="font-mono text-sm text-dark-600 mt-1">
                  {student.registrationNumber}
                </p>
                <span className={`badge mt-2 ${
                  student.status === 'Active' ? 'badge-success' :
                  student.status === 'Graduated' ? 'badge-info' : 'badge-warning'
                }`}>
                  {student.status}
                </span>
              </div>
            </div>

            {/* Contact and Academic Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-dark-500">Email</p>
                    <p className="text-sm font-medium text-dark-900">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-dark-500">Phone</p>
                    <p className="text-sm font-medium text-dark-900">{student.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-dark-500">Date of Birth</p>
                    <p className="text-sm font-medium text-dark-900">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-dark-500">Address</p>
                    <p className="text-sm font-medium text-dark-900">
                      {student.address.city}, {student.address.state}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-dark-500">Department</p>
                    <p className="text-sm font-medium text-dark-900">{student.department.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-dark-500">Batch</p>
                    <p className="text-sm font-medium text-dark-900">{student.batch}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-dark-500">Current Year</p>
                    <p className="text-sm font-medium text-dark-900">
                      Year {student.currentYear} - Semester {student.currentSemester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-dark-500">Mentor</p>
                    <p className="text-sm font-medium text-dark-900">{student.mentorName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-700 mb-1">CGPA</p>
                <p className="text-3xl font-display font-bold text-emerald-900">
                  {student.cgpa.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700 mb-1">Attendance</p>
                <p className="text-3xl font-display font-bold text-blue-900">
                  {student.attendance}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-dark-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* CGPA Chart */}
              <div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                  Academic Performance
                </h3>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                  Parent Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-dark-900 mb-3">Father's Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-dark-500">Name:</span> <span className="font-medium">{student.fatherName}</span></p>
                      <p><span className="text-dark-500">Phone:</span> <span className="font-medium">{student.fatherPhone}</span></p>
                      <p><span className="text-dark-500">Occupation:</span> <span className="font-medium">{student.fatherOccupation}</span></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-semibold text-dark-900 mb-3">Mother's Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-dark-500">Name:</span> <span className="font-medium">{student.motherName}</span></p>
                      <p><span className="text-dark-500">Phone:</span> <span className="font-medium">{student.motherPhone}</span></p>
                      <p><span className="text-dark-500">Occupation:</span> <span className="font-medium">{student.motherOccupation}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placement Status */}
              {student.currentYear === 4 && (
                <div>
                  <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                    Placement Information
                  </h3>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <Briefcase className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-700 mb-1">Status</p>
                        <p className="text-2xl font-display font-bold text-blue-900">
                          {student.placementStatus}
                        </p>
                        {student.companyName && (
                          <div className="mt-3 space-y-1">
                            <p className="text-sm"><span className="text-blue-700">Company:</span> <span className="font-semibold">{student.companyName}</span></p>
                            <p className="text-sm"><span className="text-blue-700">Package:</span> <span className="font-semibold">₹{student.package?.toLocaleString()}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-display font-bold text-dark-900">
                Semester Results
              </h3>
              <div className="space-y-4">
                {student.semesterResults.map((sem) => (
                  <div
                    key={sem.semester}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-dark-900">
                        Semester {sem.semester}
                      </h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-dark-600">
                          Credits: {sem.totalCredits}
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                          SGPA: {sem.sgpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 text-dark-600 font-medium">Course Code</th>
                            <th className="text-left py-2 text-dark-600 font-medium">Course Name</th>
                            <th className="text-center py-2 text-dark-600 font-medium">Credits</th>
                            <th className="text-center py-2 text-dark-600 font-medium">Grade</th>
                            <th className="text-center py-2 text-dark-600 font-medium">Grade Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.courses.map((course, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 font-mono text-xs">{course.courseCode}</td>
                              <td className="py-2">{course.courseName}</td>
                              <td className="py-2 text-center">{course.credits}</td>
                              <td className="py-2 text-center">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                  {course.grade}
                                </span>
                              </td>
                              <td className="py-2 text-center font-semibold">{course.gradePoint}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-display font-bold text-dark-900">
                Extra Curricular Activities
              </h3>
              {student.extraCurricular.length === 0 ? (
                <p className="text-dark-500 text-center py-8">No activities recorded</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.extraCurricular.map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-dark-900">{activity.activityName}</h4>
                        <span className="badge badge-info text-xs">{activity.category}</span>
                      </div>
                      <div className="space-y-1 text-sm text-dark-600">
                        <p><span className="font-medium">Level:</span> {activity.level}</p>
                        <p><span className="font-medium">Position:</span> {activity.position}</p>
                        <p><span className="font-medium">Date:</span> {new Date(activity.date).toLocaleDateString()}</p>
                        <p className="text-xs mt-2">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-fade-in">
              {/* Skills */}
              <div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {student.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200"
                    >
                      <p className="font-medium text-blue-900">{skill.skillName}</p>
                      <p className="text-xs text-blue-600">{skill.proficiency}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-xl font-display font-bold text-dark-900 mb-4">
                  Certifications
                </h3>
                <div className="space-y-3">
                  {student.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <h4 className="font-semibold text-dark-900 mb-2">{cert.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-dark-600">
                        <p><span className="font-medium">Issued by:</span> {cert.issuedBy}</p>
                        <p><span className="font-medium">Date:</span> {new Date(cert.issuedDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Credential ID:</span> <span className="font-mono text-xs">{cert.credentialId}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;