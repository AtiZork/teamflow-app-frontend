// src/pages/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getProjects } from "../api/projects.js";
import { getTasks } from "../api/tasks.js";
import toast from 'react-hot-toast';
import { getOrganizationMembers } from "../api/getMembers";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, membersData] = await Promise.all([
        getProjects(),
        getTasks(),
        getOrganizationMembers(),
      ]);

      console.log('📊 Loaded tasks:', tasksData);
      console.log('👥 Loaded members:', membersData);

      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(
        Array.isArray(membersData)
          ? membersData.filter(u => u.role === 'member')
          : []
      );
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPROVED: Better task status detection
  const normalizeStatus = (status) => {
    if (!status) return 'unknown';

    const statusLower = status.toLowerCase().trim();

    if (statusLower.includes('open') || statusLower.includes('to do') || statusLower === 'to_do') {
      return 'open';
    }
    if (statusLower.includes('progress') || statusLower === 'in_progress') {
      return 'in_progress';
    }
    if (statusLower.includes('qa') || statusLower === 'in_qa') {
      return 'in_qa';
    }
    if (statusLower.includes('done') || statusLower.includes('complete')) {
      return 'done';
    }

    return statusLower;
  };

  // ✅ FIXED: Task metrics with normalized status
  const taskMetrics = {
    totalTasks: tasks.length,
    openTasks: tasks.filter(t => normalizeStatus(t.status) === 'open').length,
    inProgressTasks: tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length,
    completedTasks: tasks.filter(t => normalizeStatus(t.status) === 'done').length,
    overdueTasks: tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) < new Date() &&
      normalizeStatus(t.status) !== 'done'
    ).length
  };

  // ✅ FIXED: Task status data
  const taskStatusData = [
    { name: 'Open', value: taskMetrics.openTasks },
    { name: 'In Progress', value: taskMetrics.inProgressTasks },
    { name: 'In QA', value: tasks.filter(t => normalizeStatus(t.status) === 'in_qa').length },
    { name: 'Done', value: taskMetrics.completedTasks }
  ];

  // Task priority data
  const taskPriorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length }
  ];

  // ✅ FIXED: Member performance with proper task assignment
  const memberPerformanceData = users.map(user => {
    // Find tasks assigned to this user - handle both member_ids array and member_names
    const userTasks = tasks.filter(task => {
      // Check member_ids array
      if (task.member_ids && Array.isArray(task.member_ids)) {
        return task.member_ids.includes(user.id);
      }
      // Check member_names array (if available from backend)
      if (task.member_names && Array.isArray(task.member_names)) {
        const userFullName = user.full_name || user.email.split('@')[0];
        return task.member_names.some(name =>
          name.toLowerCase().includes(userFullName.toLowerCase())
        );
      }
      // Fallback to member_id single value
      return task.member_id === user.id;
    });

    console.log(`📋 User ${user.full_name} tasks:`, userTasks);

    const completedTasks = userTasks.filter(t => normalizeStatus(t.status) === 'done').length;
    const inProgressTasks = userTasks.filter(t => normalizeStatus(t.status) === 'in_progress').length;
    const totalTasks = userTasks.length;

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      name: user.full_name || user.email.split('@')[0],
      id: user.id,
      totalTasks,
      completedTasks,
      inProgressTasks,
      progress: progressPercentage,
      overdueTasks: userTasks.filter(task =>
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        normalizeStatus(task.status) !== 'done'
      ).length
    };
  }).sort((a, b) => b.progress - a.progress);

  // Project timeline data
  const projectTimelineData = [
    { date: 'Jan', projects: 4 },
    { date: 'Feb', projects: 6 },
    { date: 'Mar', projects: 8 },
    { date: 'Apr', projects: 12 },
    { date: 'May', projects: 15 },
    { date: 'Jun', projects: 18 }
  ];

  // Debug logs
  console.log('📈 Task Metrics:', taskMetrics);
  console.log('🏆 Member Performance:', memberPerformanceData);
  console.log('🔍 All task statuses:', tasks.map(t => ({ id: t.id, status: t.status, normalized: normalizeStatus(t.status) })));

  if (loading) {
    return (
      <Layout>
        <Header
          title="Project Analytics"
          subtitle="Comprehensive overview of projects, tasks, and team performance"
        />

        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Project Analytics"
        subtitle="Comprehensive overview of projects, tasks, and team performance"
      />

      <div className="analytics-dashboard">
        {/* Dashboard Header Controls */}
        <div className="header-controls">
          <select
            className="time-filter"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="yearToDate">Year to Date</option>
          </select>
          <button className="export-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Report
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Performance
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon projects">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div className="metric-info">
                <p className="metric-label">Total Projects</p>
                <p className="metric-value">{projects.length}</p>
                <div className="metric-change positive">
                  <span>+2.5%</span> from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon tasks">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="metric-info">
                <p className="metric-label">Total Tasks</p>
                <p className="metric-value">{taskMetrics.totalTasks}</p>
                <div className="metric-change positive">
                  <span>+5.2%</span> from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon in-progress">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="metric-info">
                <p className="metric-label">In Progress</p>
                <p className="metric-value">{taskMetrics.inProgressTasks}</p>
                <div className="metric-change negative">
                  <span>-1.3%</span> from last month
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon completed">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="metric-info">
                <p className="metric-label">Completed</p>
                <p className="metric-value">{taskMetrics.completedTasks}</p>
                <div className="metric-change positive">
                  <span>+8.7%</span> from last month
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Task Status Distribution</h3>
                <div className="chart-actions">
                  <button className="icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent, index }) => {
                        if (taskStatusData[index].value === 0) return '';
                        return `${name}: ${(percent * 100).toFixed(0)}%`;
                      }}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Task Priority Distribution</h3>
                <div className="chart-actions">
                  <button className="icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {taskPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Team Performance Section */}
          <div className="performance-section">
            <div className="section-header">
              <h2>Team Member Performance</h2>
              <div className="section-actions">
                <button className="btn-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12H9"></path>
                    <path d="M21 6H9"></path>
                    <path d="M21 18H9"></path>
                    <path d="M5 12h.01"></path>
                    <path d="M5 6h.01"></path>
                    <path d="M5 18h.01"></path>
                  </svg>
                  Filter
                </button>
              </div>
            </div>

            <div className="performance-table-container">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Total Tasks</th>
                    <th>Completed</th>
                    <th>In Progress</th>
                    <th>Progress</th>
                    <th>Overdue</th>
                    <th>Productivity</th>
                  </tr>
                </thead>
                <tbody>
                  {memberPerformanceData.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="member-info">
                          <div className="avatar">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td>{member.totalTasks}</td>
                      <td>{member.completedTasks}</td>
                      <td>{member.inProgressTasks}</td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${member.progress}%` }}
                          ></div>
                          <span className="progress-text">{member.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${member.overdueTasks > 0 ? 'overdue' : 'good'}`}>
                          {member.overdueTasks}
                        </span>
                      </td>
                      <td>
                        <div className="productivity-score">
                          <div className="score-bar">
                            <div
                              className="score-fill"
                              style={{ width: `${Math.min(100, member.progress + (member.completedTasks * 2))}%` }}
                            ></div>
                          </div>
                          <span>{Math.min(100, member.progress + (member.completedTasks * 2))}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="timeline-section">
            <div className="section-header">
              <h2>Project Activity Timeline</h2>
              <div className="section-actions">
                <button className="btn-secondary">
                  Monthly
                </button>
                <button className="btn-secondary active">
                  Quarterly
                </button>
                <button className="btn-secondary">
                  Yearly
                </button>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="projects"
                    stroke="#4f46e5"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    name="Active Projects"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}