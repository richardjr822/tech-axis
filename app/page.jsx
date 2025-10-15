"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Header from "./components/Header";
import StatCards from "./components/StatCards";
import InventoryList from "./components/InventoryList";
import InventoryForm from "./components/InventoryForm";
import ArchiveConfirmation from "./components/ArchiveConfirmation";
import ArchivedItemsModal from "./components/ArchivedItemsModal";
import Notification from "./components/Notification";
import Login from "./components/Login";
import Accounts from "./components/Accounts";
import ActivityLog from "./components/ActivityLog";
import ReportGenerator from "./components/ReportGenerator";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [formMode, setFormMode] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: 1, category: "", status: "In Stock", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showGenerateAccount, setShowGenerateAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Fetch inventory items from API - only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentPage]);

  // Client-side filtering without API calls
  useEffect(() => {
    if (allItems.length > 0) {
      applyFilters();
    }
  }, [searchTerm, selectedCategory, selectedStatus, dateFilter, allItems, sortField, sortOrder]);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      setCurrentUser(data.user);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoginError("");
      showNotification(`Welcome back, ${data.user.fullName || data.user.username}!`, "success");
    } catch (error) {
      setLoginError(error.message || "Invalid username or password");
      throw error;
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setItems([]);
    setAllItems([]);
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setDateFilter("all");
    setFormMode(null);
    setShowLogoutConfirm(false);
    showNotification("Logged out successfully", "success");
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sort: 'name',
        order: 'asc',
      });
      
      const inventoryResponse = await fetch(`/api/inventory?${params}`);
      
      if (!inventoryResponse.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const inventoryData = await inventoryResponse.json();
      
      const categoriesResponse = await fetch('/api/categories');
      
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await categoriesResponse.json();
      
      setAllItems(inventoryData.items || []);
      setPagination(inventoryData.pagination || null);
      
      const categoryNames = (categoriesData.categories || []).map(cat => 
        typeof cat === 'string' ? cat : cat.name
      );
      setCategories(categoryNames);
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering function
  const applyFilters = useCallback(() => {
    let filtered = [...allItems];

    // Search by name
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt || item.dateAdded);
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            return diffDays <= 1;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "year":
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setItems(filtered);
  }, [allItems, searchTerm, selectedCategory, selectedStatus, dateFilter, sortField, sortOrder]);

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setDateFilter("all");
    setSortField("name");
    setSortOrder("asc");
    showNotification("Filters cleared", "success");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || dateFilter !== "all";

  const resetForm = () => {
    setFormMode(null);
    setFormData({ name: "", quantity: 1, category: "", status: "In Stock", description: "" });
    setFormErrors({});
    setEditingId(null);
  };

  const startEdit = (item) => {
    setFormMode('edit');
    setFormData({ ...item });
    setEditingId(item._id);
    setFormErrors({});
  };

  const confirmArchive = (id) => {
    const item = items.find(item => item._id === id);
    setArchiveConfirm(item);
  };

  const handleArchive = async () => {
    if (!archiveConfirm) return;
    
    setIsArchiving(true);
    const id = archiveConfirm._id;
    
    try {
      const response = await fetch(`/api/inventory/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser?.fullName || currentUser?.username || 'Unknown User'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive item');
      }
      
      setAllItems(prevItems => prevItems.filter(item => item._id !== id));
      setItems(prevItems => prevItems.filter(item => item._id !== id));
      
      showNotification("Item archived successfully");
      
      if (pagination) {
        setPagination({
          ...pagination,
          total: pagination.total - 1,
          totalPages: Math.ceil((pagination.total - 1) / pagination.limit)
        });
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setArchiveConfirm(null);
      setIsArchiving(false);
    }
  };

  const cancelArchive = () => {
    setArchiveConfirm(null);
  };

  const handleRestoreItem = async () => {
    await fetchData();
    showNotification("Item restored successfully", "success");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFormSubmit = async (submittedFormData) => {
    try {
      const dataWithUser = {
        ...submittedFormData,
        username: currentUser?.username
      };

      if (!dataWithUser.name || !dataWithUser.category) {
        throw new Error('Please fill in all required fields (Name and Category)');
      }

      if (formMode === 'add') {
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataWithUser),
        });
        
        const responseText = await response.text();
        let data;
        
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          throw new Error('Server returned invalid response');
        }
        
        if (!response.ok) {
          throw new Error(data.error || data.message || `Server error: ${response.status}`);
        }
        
        setAllItems(prev => [data.item, ...prev]);
        
        if (pagination) {
          setPagination({
            ...pagination,
            total: pagination.total + 1,
            totalPages: Math.ceil((pagination.total + 1) / pagination.limit)
          });
        }
        
        showNotification("Item added successfully");
      } else if (formMode === 'edit' && editingId) {
        const response = await fetch(`/api/inventory/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataWithUser),
        });
        
        const responseText = await response.text();
        let data;
        
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          throw new Error('Server returned invalid response');
        }
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to update item');
        }
        
        setAllItems(prev => prev.map(item => 
          item._id === editingId ? data.item : item
        ));
        
        showNotification("Item updated successfully");
      }
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      resetForm();
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
        <div className="absolute top-20 right-0 w-2/5 h-2/5 bg-orange-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-10 left-0 w-1/3 h-1/3 bg-orange-600/20 rounded-full mix-blend-overlay filter blur-2xl opacity-40"></div>
        <div className="absolute top-1/3 left-1/4 w-1/5 h-1/5 bg-orange-400/10 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwaDYwVjBoLTYweiIvPjxwYXRoIGQ9Ik02MCAzMC41djFINTl2LTF6TTYwIDAgMCAwdjU5aDFWMWg1OXoiIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iLjIiLz48cGF0aCBkPSJNMzAgNjBoMXYtMWgtMXpNMzAgMGgxdjFoLTF6TTAgMzBoNjB2MUgweiIgZmlsbD0iIzIwMjAyMCIgZmlsbC1vcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-[0.04]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%23FF5500' stroke-width='0.5'/%3E%3Cpath d='M30 10v20m0 10v20m0 10v10M50 10v80M70 10v20m0 10v20m0 10v10M10 30h20m10 0h20m10 0h20M10 50h80M10 70h20m10 0h20m10 0h20' stroke='%23FF5500' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='50' cy='30' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='70' cy='30' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='30' cy='50' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='50' cy='50' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='70' cy='50' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='30' cy='70' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='50' cy='70' r='2.5' fill='%23FF5500'/%3E%3Ccircle cx='70' cy='70' r='2.5' fill='%23FF5500'/%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
        onOpenActivityLog={currentUser?.role === 'owner' ? () => setShowActivityLog(true) : null}
        onOpenAccounts={() => setShowGenerateAccount(true)}
        onViewArchived={() => setShowArchivedModal(true)}
        onGenerateReport={currentUser?.role === 'owner' ? () => setShowReportGenerator(true) : null}
      />

      <div className="flex-1 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-between items-center flex-wrap gap-4"
          >
            <button 
              onClick={() => setFormMode('add')}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Item
            </button>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`bg-gray-900 text-white border px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 font-medium ${
                  hasActiveFilters ? 'border-orange-500 text-orange-500' : 'border-gray-700'
                }`}
                title="Toggle Filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden md:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                )}
              </button>

              <button 
                onClick={() => setShowArchivedModal(true)}
                className="bg-gray-900 text-white border border-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-800 hover:border-orange-500/50 transition-all duration-300 flex items-center gap-2 font-medium"
                title="View Archived Items"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="hidden md:inline">Archived</span>
              </button>

              <button 
                onClick={() => fetchData()}
                className="bg-gray-900 text-white border border-gray-700 p-2 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 flex items-center justify-center h-11 w-11 group"
                disabled={isLoading}
                title="Refresh Data"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items by name or description..."
                className="pl-11 pr-4 py-4 border border-gray-800 rounded-xl w-full focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-gray-900/80 text-white shadow-lg backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 rounded-full" style={{ width: searchTerm ? '100%' : '0%' }}></div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Filter Options
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat, index) => (
                          <option key={`category-${index}-${cat}`} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      >
                        <option value="all">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date Added</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">
                      Showing <span className="text-orange-500 font-semibold">{items.length}</span> of <span className="text-white font-semibold">{allItems.length}</span> items
                      {hasActiveFilters && <span className="text-gray-500"> (filtered)</span>}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-red-900/30 border border-red-800/50 text-white px-5 py-4 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-red-300">Error loading data</h3>
                  <div className="mt-2 text-sm text-red-200">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={fetchData}
                      className="inline-flex items-center px-4 py-2 border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 text-red-100 text-sm font-medium rounded-lg transition-colors duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Loading inventory data...</h3>
              <p className="text-gray-400 text-sm">Connecting to Tech Axis database</p>
            </motion.div>
          )}

          {!isLoading && allItems.length > 0 && (
            <StatCards items={allItems} />
          )}
          
          {!isLoading && (
            <div className="flex-1 min-h-[300px]">
              <InventoryList 
                items={items}
                onEdit={startEdit}
                onArchive={currentUser?.role === 'owner' ? confirmArchive : null}
                searchTerm={searchTerm}
                showEmptyState={items.length === 0}
                onAddFirstItem={() => setFormMode('add')}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-gray-800 py-6 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} <span className="text-white font-medium">Tech Axis PC Store</span>. All rights reserved.
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Logout</h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to logout from Tech Axis Inventory System?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-600/20"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {archiveConfirm && (
          <ArchiveConfirmation
            item={archiveConfirm}
            onConfirm={handleArchive}
            onCancel={cancelArchive}
            isArchiving={isArchiving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArchivedModal && (
          <ArchivedItemsModal
            onClose={() => setShowArchivedModal(false)}
            currentUser={currentUser}
            onRestore={handleRestoreItem}
          />
        )}
      </AnimatePresence>
  
      <AnimatePresence>
        {formMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={resetForm}></div>
            <div 
              className="relative z-[110] w-full max-w-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <InventoryForm 
                formMode={formMode}
                formData={formData}
                onSubmit={handleFormSubmit}
                onCancel={resetForm}
                errors={formErrors}
                categories={categories}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGenerateAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGenerateAccount(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Accounts 
                currentUser={currentUser}
                onClose={() => setShowGenerateAccount(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showActivityLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowActivityLog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[60%] h-[90vh]"
            >
              <ActivityLog 
                currentUser={currentUser}
                onClose={() => setShowActivityLog(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Settings Component</h2>
              <p className="text-gray-400 mb-6">Your Settings component will go here</p>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportGenerator && (
          <ReportGenerator
            onClose={() => setShowReportGenerator(false)}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
      
      <Notification 
        message={notification?.message}
        type={notification?.type || "success"}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}