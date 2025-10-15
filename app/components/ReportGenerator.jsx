"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function ReportGenerator({ onClose, currentUser }) {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      // Remove duplicates and ensure we have strings
      const uniqueCategories = [...new Set(
        (data.categories || []).map(cat => 
          typeof cat === 'string' ? cat : cat.name || String(cat)
        )
      )].filter(Boolean);
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (dateRange && dateRange !== "all") {
        params.append("dateRange", dateRange);
      }
      
      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      }
      
      if (selectedStatuses.length > 0) {
        params.append("statuses", selectedStatuses.join(","));
      }

      console.log('Fetching report with params:', params.toString());
      
      const response = await fetch(`/api/reports/inventory?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      console.log('Report data received:', data);
      
      if (!data.items || data.items.length === 0) {
        setError('No items found matching the selected filters.');
      }
      
      setReportData(data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const downloadPDF = () => {
    if (!reportData || !reportData.items || reportData.items.length === 0) {
      setError('No data available to download');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(255, 85, 0);
    doc.text("Tech Axis PC Store", pageWidth / 2, 15, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Inventory Report", pageWidth / 2, 25, { align: "center" });
    
    // Date and user info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${dateStr}`, 14, 35);
    doc.text(`By: ${currentUser?.fullName || currentUser?.username}`, 14, 40);

    // Summary section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Items: ${reportData.summary.totalItems}`, 14, 58);
    doc.text(`Total Categories: ${reportData.summary.totalCategories}`, 14, 64);
    doc.text(`In Stock: ${reportData.summary.inStock}`, 14, 70);
    doc.text(`Low Stock: ${reportData.summary.lowStock}`, 80, 70);
    doc.text(`Out of Stock: ${reportData.summary.outOfStock}`, 130, 70);
    doc.text(`Total Quantity: ${reportData.summary.totalQuantity}`, 14, 76);

    // Table
    const tableData = reportData.items.map(item => [
      item.name,
      item.category,
      item.quantity.toString(),
      item.status,
      item.description || 'N/A',
      new Date(item.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Item Name', 'Category', 'Quantity', 'Status', 'Description', 'Date Added']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: { 
        fillColor: [255, 85, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25 },
        4: { cellWidth: 40 },
        5: { cellWidth: 25 }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Generate filename
    const filename = `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.items || reportData.items.length === 0) {
      setError('No data available to download');
      return;
    }

    // CSV Header
    const headers = ['Item Name', 'Category', 'Quantity', 'Status', 'Description', 'Date Added'];
    
    // CSV Rows
    const rows = reportData.items.map(item => [
      `"${item.name}"`,
      `"${item.category}"`,
      item.quantity,
      `"${item.status}"`,
      `"${item.description || 'N/A'}"`,
      new Date(item.createdAt).toLocaleDateString()
    ]);

    // Combine
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setDateRange("all");
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setReportData(null);
    setError(null);
  };

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Generate Report
            </h2>
            <p className="text-gray-400 text-sm mt-1">Export inventory data as PDF or CSV</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Date Range</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {dateRangeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateRange === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <button
                    key={`${category}-${index}`}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No categories available</p>
              )}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Status</label>
            <div className="flex flex-wrap gap-2">
              {['In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedStatuses.includes(status)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={generateReport}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
          <button
            onClick={resetFilters}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
          >
            Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Report Preview */}
        {reportData && reportData.items && reportData.items.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Report Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Total Items</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.totalItems}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Categories</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.totalCategories}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Total Quantity</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.totalQuantity}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-green-400 text-xs mb-1">In Stock</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.inStock}</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <p className="text-yellow-400 text-xs mb-1">Low Stock</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.lowStock}</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4">
                <p className="text-red-400 text-xs mb-1">Out of Stock</p>
                <p className="text-white text-2xl font-bold">{reportData.summary.outOfStock}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadPDF}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={downloadCSV}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}