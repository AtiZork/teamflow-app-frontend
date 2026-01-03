

// src/components/SearchManager.jsx
import React, { useState } from 'react';
import SearchBlock from './SearchBlock';
import SearchResultsBlock from './SearchResultsBlock';
import { searchTasks } from '../api/tasks';
import { getOrganizationMembers } from '../api/users'; // Import the members API

const TaskSearchManager = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [allMembers, setAllMembers] = useState([]); // Store all members for mapping

  // Load members when component mounts
  React.useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersData = await getOrganizationMembers();
        setAllMembers(membersData || []);
      } catch (error) {
        console.error('Failed to load members:', error);
        setAllMembers([]);
      }
    };
    
    loadMembers();
  }, []);

  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      console.log('🔄 Starting search with:', searchData);
      
      // Map frontend field names to backend field names
      const apiFilters = {
        fromDate: searchData.fromDate || '',
        toDate: searchData.toDate || '',
        title: searchData.title || '',
        status: searchData.status || '',
        priority: searchData.priority || '',
        assignedTo: searchData.assignedTo || ''
      };

      console.log('📤 Sending API filters:', apiFilters);

      const results = await searchTasks(apiFilters);
      console.log('📥 Received results:', results);
      setSearchResults(results);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResults = () => {
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  // Transform API data to match SearchResultsBlock format WITH ACTUAL MEMBER NAMES
  const transformResults = (apiResults) => {
    return apiResults.map((task, index) => {
      // Fixed: Map member_ids to actual member names
      const assignedMembers = task.member_ids && task.member_ids.length > 0 
        ? task.member_ids.map(memberId => {
            const member = allMembers.find(m => m.id === memberId);
            return member ? (member.full_name || member.email) : `User ${memberId}`;
          })
        : [];

      return {
        id: task.id,
        ticketId: task.project_name || `Task-${task.id}`,
        title: task.title,
        projectType: task.project_name || 'General',
        status: task.status,
        priority: task.priority,
        createdBy: 'Current User',
        department: 'Operation',
        location: 'Office',
        assignedTo: assignedMembers.length > 0 ? assignedMembers.join(', ') : 'Unassigned',
        assignedDepartment: 'Dev',
        // Fixed: store the actual member names for display
        memberNames: assignedMembers
      };
    });
  };

  return (
    <div>
      <SearchBlock onSubmit={handleSearch} />
      
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#666'
        }}>
          Searching...
        </div>
      )}
      
      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          margin: '10px 0',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      {hasSearched && !loading && (
        <SearchResultsBlock 
          searchResults={transformResults(searchResults)} 
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
};

export default TaskSearchManager;










