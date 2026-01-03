// api/hoursApi.js

import axios from 'axios';
import { API_URL } from "../config/apiConfig";

class HoursApi {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get today's hours for current user
   * @returns {Promise} Today's hours breakdown
   */
  async getTodayHours() {
    try {
      const response = await this.api.get('/hours/today');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch today\'s hours'
      };
    }
  }

  /**
   * Get weekly hours summary for current user
   * @param {Date|string} weekStart - Start date of the week (optional)
   * @returns {Promise} Weekly hours summary
   */
  async getWeeklyHours(weekStart = null) {
    try {
      const params = {};
      if (weekStart) {
        // Convert to YYYY-MM-DD format
        const date = weekStart instanceof Date ? weekStart : new Date(weekStart);
        params.week_start = date.toISOString().split('T')[0];
      }
      
      const response = await this.api.get('/hours/weekly', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch weekly hours'
      };
    }
  }

  /**
   * Get monthly hours summary for current user
   * @param {string} monthYear - Month in YYYY-MM format (optional)
   * @returns {Promise} Monthly hours summary
   */
  async getMonthlyHours(monthYear = null) {
    try {
      const params = {};
      if (monthYear) {
        params.month_year = monthYear;
      }
      
      const response = await this.api.get('/hours/monthly', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch monthly hours'
      };
    }
  }

  /**
   * Get comprehensive hours summary for current employee
   * Includes today, current week, current month, and year-to-date
   * @returns {Promise} Complete employee hours summary
   */
  async getEmployeeHoursSummary() {
    try {
      const response = await this.api.get('/hours/employee/summary');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch employee hours summary'
      };
    }
  }

  /**
   * Get hours report for all employees in organization (Admin only)
   * @param {Object} options - Filter options
   * @param {string} options.period - Time period: 'daily', 'weekly', 'monthly', 'yearly'
   * @param {Date|string} options.startDate - Start date
   * @param {Date|string} options.endDate - End date
   * @returns {Promise} Organization hours report
   */
  async getOrganizationHours({ period = 'monthly', startDate = null, endDate = null } = {}) {
    try {
      const params = {
        period: period
      };
      
      if (startDate) {
        const date = startDate instanceof Date ? startDate : new Date(startDate);
        params.start_date = date.toISOString().split('T')[0];
      }
      
      if (endDate) {
        const date = endDate instanceof Date ? endDate : new Date(endDate);
        params.end_date = date.toISOString().split('T')[0];
      }
      
      const response = await this.api.get('/hours/organization', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch organization hours'
      };
    }
  }

  /**
   * Get hours data for a specific employee (Admin only)
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @param {string} options.period - Time period
   * @param {Date|string} options.startDate - Start date
   * @param {Date|string} options.endDate - End date
   * @returns {Promise} Employee hours data
   */
  async getEmployeeHours(employeeId, { period = 'monthly', startDate = null, endDate = null } = {}) {
    try {
      // Note: This uses a different endpoint structure
      // You might need to create a separate endpoint for this or modify the existing ones
      // For now, we'll filter from organization data
      const orgData = await this.getOrganizationHours({ period, startDate, endDate });
      
      if (!orgData.success) {
        return orgData;
      }
      
      const employeeData = orgData.data.find(emp => emp.employee_id === employeeId);
      
      if (!employeeData) {
        return {
          success: false,
          error: 'Employee not found in the organization hours data'
        };
      }
      
      return {
        success: true,
        data: employeeData
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || `Failed to fetch hours for employee ${employeeId}`
      };
    }
  }

  /**
   * Get hours report for a specific date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {Array<number>} employeeIds - Array of employee IDs to filter (optional)
   * @returns {Promise} Custom date range hours report
   */
  async getHoursReport(startDate, endDate, employeeIds = null) {
    try {
      const params = {
        period: 'custom',
        start_date: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
        end_date: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate
      };
      
      // Note: You might need to modify the backend to accept employee_ids parameter
      // For now, we'll fetch all and filter client-side
      const response = await this.api.get('/hours/organization', { params });
      
      let data = response.data;
      
      // Filter by employee IDs if provided
      if (employeeIds && employeeIds.length > 0) {
        data = data.filter(emp => employeeIds.includes(emp.employee_id));
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch hours report'
      };
    }
  }

  /**
   * Export hours report as CSV
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise} CSV data
   */
  async exportHoursReport(startDate, endDate) {
    try {
      const response = await this.api.get('/hours/export', {
        params: {
          start_date: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
          end_date: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate
        },
        responseType: 'blob' // Important for file download
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hours_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return {
        success: true,
        message: 'Export started successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to export hours report'
      };
    }
  }

  // Helper methods for common calculations

  /**
   * Parse time string (HH:MM) to minutes
   * @param {string} timeStr - Time in HH:MM format
   * @returns {number} Total minutes
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr === '00:00') return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes to time string (HH:MM)
   * @param {number} totalMinutes - Total minutes
   * @returns {string} Time in HH:MM format
   */
  formatMinutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate productive percentage
   * @param {string} productiveHours - Productive hours (HH:MM)
   * @param {string} totalHours - Total hours (HH:MM)
   * @returns {number} Productive percentage (0-100)
   */
  calculateProductivePercentage(productiveHours, totalHours) {
    const productiveMinutes = this.parseTimeToMinutes(productiveHours);
    const totalMinutes = this.parseTimeToMinutes(totalHours);
    
    if (totalMinutes === 0) return 0;
    return Math.round((productiveMinutes / totalMinutes) * 100);
  }

  /**
   * Calculate average hours per day
   * @param {string} totalHours - Total hours (HH:MM)
   * @param {number} workingDays - Number of working days
   * @returns {string} Average hours per day (HH:MM)
   */
  calculateAverageHoursPerDay(totalHours, workingDays) {
    if (workingDays === 0) return '00:00';
    const totalMinutes = this.parseTimeToMinutes(totalHours);
    const averageMinutes = Math.round(totalMinutes / workingDays);
    return this.formatMinutesToTime(averageMinutes);
  }

  /**
   * Get current week dates
   * @returns {Object} Week start and end dates
   */
  getCurrentWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      weekNumber: this.getWeekNumber(weekStart)
    };
  }

  /**
   * Get week number for a date
   * @param {Date} date - Date to get week number for
   * @returns {number} Week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get month data
   * @param {string} monthYear - Month in YYYY-MM format
   * @returns {Object} Month information
   */
  getMonthData(monthYear = null) {
    const today = new Date();
    const year = monthYear ? parseInt(monthYear.split('-')[0]) : today.getFullYear();
    const month = monthYear ? parseInt(monthYear.split('-')[1]) - 1 : today.getMonth();
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthName = monthStart.toLocaleString('default', { month: 'long' });
    
    return {
      monthYear: `${year}-${(month + 1).toString().padStart(2, '0')}`,
      monthName: `${monthName} ${year}`,
      monthStart: monthStart.toISOString().split('T')[0],
      monthEnd: monthEnd.toISOString().split('T')[0],
      daysInMonth: monthEnd.getDate(),
      firstDay: monthStart.getDay()
    };
  }

  /**
   * Get date ranges for different periods
   * @param {string} period - Period type
   * @returns {Object} Start and end dates
   */
  getDateRangeForPeriod(period) {
    const today = new Date();
    
    switch (period.toLowerCase()) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
        
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return {
          start: yesterday.toISOString().split('T')[0],
          end: yesterday.toISOString().split('T')[0]
        };
        
      case 'thisweek':
        return this.getCurrentWeekDates();
        
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return {
          start: lastWeekStart.toISOString().split('T')[0],
          end: lastWeekEnd.toISOString().split('T')[0]
        };
        
      case 'thismonth':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: monthStart.toISOString().split('T')[0],
          end: monthEnd.toISOString().split('T')[0]
        };
        
      case 'lastmonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        return {
          start: lastMonthStart.toISOString().split('T')[0],
          end: lastMonthEnd.toISOString().split('T')[0]
        };
        
      case 'thisyear':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        return {
          start: yearStart.toISOString().split('T')[0],
          end: yearEnd.toISOString().split('T')[0]
        };
        
      default:
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
    }
  }
}

// Create and export singleton instance
const hoursApi = new HoursApi();
export default hoursApi;

// Also export class for testing or custom instances
export { HoursApi };