// pages/Dashboard.jsx (Updated with proper spacing)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, departmentAPI } from '../services/api';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Award,
  ChevronRight,
  Loader2,
  BookOpen
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, deptsRes, topRes] = await Promise.all([
        studentAPI.getDashboardStats(),
        departmentAPI.getAll(),
        studentAPI.getTopPerformers({ limit: 5 })
      ]);

      setStats(statsRes.data);
      setDepartments(deptsRes.data);
      setTopPerformers(topRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Departments',
      value: departments.length,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Average CGPA',
      value: stats?.avgCGPA?.toFixed(2) || '0.00',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Placed Students',
      value: stats?.placedStudents || 0,
      icon: Award,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-dark-600">
          Welcome back! Here's what's happening with your departments
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card group hover:scale-105 transform transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-display font-bold text-dark-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div className={`h-2 bg-gradient-to-r ${stat.color} rounded-full mt-4`}></div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Departments Section */}
        <div className="lg:col-span-2 card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-dark-900">
              Departments
            </h2>
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            {departments.slice(0, 3).map((dept, index) => (
              <Link
                key={dept._id}
                to={`/department/${dept.code}`}
                className="block p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm px-3 py-1 rounded-lg">
                        {dept.code}
                      </div>
                      <h3 className="font-semibold text-dark-900 group-hover:text-blue-600 transition-colors">
                        {dept.name}
                      </h3>
                    </div>
                    <p className="text-sm text-dark-600 line-clamp-2">{dept.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="text-dark-500">
                        <span className="font-medium text-dark-700">{dept.totalStudents || 0}</span> Students
                      </span>
                      <span className="text-dark-500">HOD: {dept.hodName || 'TBD'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-dark-900">
              Top Performers
            </h2>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {topPerformers.slice(0, 5).map((student, index) => (
              <Link
                key={student._id}
                to={`/student/${student._id}`}
                className="block p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 border border-slate-200 hover:border-blue-300 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-dark-900 truncate group-hover:text-blue-600 transition-colors">
                        {student.name}
                      </p>
                      <span className="text-sm font-bold text-emerald-600">
                        {student.cgpa?.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-dark-500 mt-0.5">{student.registrationNumber}</p>
                    <p className="text-xs text-dark-600 mt-1 truncate">
                      {student.department?.name || student.departmentCode}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Year-wise Distribution */}
      {stats?.yearWise && stats.yearWise.length > 0 && (
        <div className="card animate-fade-in">
          <h2 className="text-2xl font-display font-bold text-dark-900 mb-6">
            Year-wise Student Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.yearWise.map((year) => (
              <div
                key={year._id}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
              >
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Year {year._id}
                </p>
                <p className="text-3xl font-display font-bold text-blue-900">
                  {year.count}
                </p>
                <p className="text-xs text-blue-600 mt-1">Students</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;