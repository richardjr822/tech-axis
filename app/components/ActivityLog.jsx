"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ActivityLog = ({ currentUser, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/activity-log');
      const data = await response.json();
      if (response.ok && data.success) {
        setActivities(data.activities || []);
      } else {
        setError(data.error || 'Failed to fetch activities');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'item_added': return 'text-green-500';
      case 'item_updated': return 'text-yellow-500';
      case 'item_deleted': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case 'item_added': return 'Added';
      case 'item_updated': return 'Updated';
      case 'item_deleted': return 'Deleted';
      default: return 'Activity';
    }
  };

  const filterActivitiesByDate = (activities) => {
    if (!activities || activities.length === 0) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    switch (dateFilter) {
      case 'today':
        return activities.filter(a => new Date(a.timestamp) >= today);
      case 'yesterday':
        return activities.filter(a => {
          const date = new Date(a.timestamp);
          return date >= yesterday && date < today;
        });
      case 'week':
        return activities.filter(a => new Date(a.timestamp) >= weekAgo);
      case 'all':
      default:
        return activities;
    }
  };

  const filteredActivities = filterActivitiesByDate(
    activities
      .filter(activity =>
        filterType === 'all' || activity.type === filterType
      )
      .filter(activity =>
        activity.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const activityTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'item_added', label: 'Added' },
    { value: 'item_updated', label: 'Updated' },
    { value: 'item_deleted', label: 'Deleted' },
  ];

  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl w-full h-full overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-orange-900/20 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-orange-500/10 p-3 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Inventory Activity Log</h2>
              <p className="text-sm text-gray-400">
                {isLoading ? 'Loading...' : `${filteredActivities.length} ${filteredActivities.length === 1 ? 'activity' : 'activities'} found`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActivities}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50"
              title="Refresh activities"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-900/30 border-b border-gray-800 flex-shrink-0">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by user, item, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table View - Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-red-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Activities</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchActivities}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading activities...</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Activities Found</h3>
              <p className="text-gray-400 mb-2">
                {activities.length === 0 
                  ? 'No inventory activities recorded yet.' 
                  : 'No activities match your current filters.'}
              </p>
              <p className="text-gray-500 text-sm">
                {activities.length === 0 
                  ? 'Start by adding, updating, or deleting items.' 
                  : 'Try adjusting your search or filter options.'}
              </p>
              {activities.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setDateFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-900/80 sticky top-0 z-10 backdrop-blur-sm">
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredActivities.map((activity, index) => (
                  <motion.tr
                    key={activity._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)} bg-gray-800 border ${
                        activity.type === 'item_added' ? 'border-green-500/20' :
                        activity.type === 'item_updated' ? 'border-yellow-500/20' :
                        'border-red-500/20'
                      }`}>
                        {getActivityLabel(activity.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {activity.itemName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400 max-w-md">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs mr-2">
                          {activity.user?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {activity.user}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;