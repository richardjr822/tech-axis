import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InventoryList = ({ 
  items, 
  onEdit, 
  onDelete, 
  searchTerm = "", 
  showEmptyState = false,
  onAddFirstItem,
  isLoading = false,
  pagination = null,
  onPageChange = () => {},
  onSort = () => {},
  sortField = 'name',
  sortOrder = 'asc'
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case "In Stock": return "bg-green-100 text-green-800 border-green-200";
      case "Low Stock": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Highlight the matched text in search results
  const highlightText = (text, term) => {
    if (!term.trim() || !text) return text;
    
    const regex = new RegExp(`(${term.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-orange-200 text-black font-medium">{part}</span> : part
    );
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1 text-orange-500">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Handle sort click
  const handleSortClick = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-black rounded-xl shadow-xl p-12 text-center border border-gray-800 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-orange-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-bold text-white">Loading inventory...</h3>
        <p className="text-gray-400 mt-2">Fetching your latest inventory data</p>
      </div>
    );
  }

  // Empty state view
  if (showEmptyState || items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black text-white rounded-xl shadow-xl p-12 text-center border border-gray-800"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-black rounded-full border-2 border-orange-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-white">
          {searchTerm ? "No matching items found" : "Your inventory is empty"}
        </h3>
        
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {searchTerm 
            ? `We couldn't find any items matching "${searchTerm}". Try a different search term or clear your search.`
            : "You don't have any inventory items yet. Add your first item to get started."}
        </p>
        
        {!searchTerm && (
          <button
            onClick={onAddFirstItem}
            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add First Item
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-black rounded-xl shadow-xl overflow-hidden border border-gray-800"
    >
      <div className="grid grid-cols-12 bg-gray-900 p-4 text-gray-300 border-b border-gray-800">
        <div 
          className="col-span-3 font-medium cursor-pointer flex items-center hover:text-white transition-colors"
          onClick={() => handleSortClick('name')}
        >
          Item Name <SortIndicator field="name" />
        </div>
        <div 
          className="col-span-2 font-medium cursor-pointer flex items-center hover:text-white transition-colors"
          onClick={() => handleSortClick('quantity')}
        >
          Quantity <SortIndicator field="quantity" />
        </div>
        <div 
          className="col-span-2 font-medium cursor-pointer flex items-center hover:text-white transition-colors"
          onClick={() => handleSortClick('category')}
        >
          Category <SortIndicator field="category" />
        </div>
        <div 
          className="col-span-2 font-medium cursor-pointer flex items-center hover:text-white transition-colors"
          onClick={() => handleSortClick('status')}
        >
          Status <SortIndicator field="status" />
        </div>
        <div className="col-span-3 text-right font-medium">Actions</div>
      </div>
      
      <div className="divide-y divide-gray-800 relative">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              key={item._id || item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className={`grid grid-cols-12 p-4 items-center relative ${
                hoveredRow === (item._id || item.id) ? 'bg-gray-900' : 'bg-black'
              } transition-colors duration-200`}
              onMouseEnter={() => setHoveredRow(item._id || item.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="col-span-3 font-medium text-white">
                <div>{highlightText(item.name, searchTerm)}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</div>
              </div>
              
              <div className="col-span-2 text-gray-300">
                <span className={`${
                  item.quantity === 0 ? 'text-red-400' : 
                  item.quantity <= 5 ? 'text-orange-400' : 
                  'text-gray-300'
                }`}>
                  {item.quantity}
                </span>
              </div>
              
              <div className="col-span-2 text-gray-300">
                {highlightText(item.category, searchTerm)}
              </div>
              
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              
              <div className="col-span-3 flex justify-end space-x-2">
                <button 
                  onClick={() => onEdit(item)}
                  className="bg-gray-800 text-white hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(item._id || item.id)}
                  className="bg-gray-800 text-white hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
              
              {hoveredRow === (item._id || item.id) && (
                <motion.div 
                  layoutId="hoverBorder"
                  className="absolute left-0 top-0 w-1 h-full bg-orange-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="bg-gray-900 px-4 py-3 border-t border-gray-800 flex flex-wrap items-center justify-between">
        <div className="text-gray-400 text-sm">
          {pagination ? (
            <>Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items</>
          ) : (
            <>Showing {items.length} items</>
          )}
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <div className="flex space-x-1 mt-2 sm:mt-0">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded text-sm font-medium ${
                pagination.page === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              First
            </button>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded text-sm font-medium ${
                pagination.page === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Prev
            </button>
            
            {[...Array(pagination.totalPages).keys()].map(x => x + 1)
              .filter(p => (
                p === 1 || 
                p === pagination.totalPages || 
                (p >= pagination.page - 1 && p <= pagination.page + 1)
              ))
              .map((pageNum, i, array) => (
                <Fragment key={pageNum}>
                  {i > 0 && array[i-1] !== pageNum - 1 && (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      pagination.page === pageNum
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                </Fragment>
              ))
            }
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded text-sm font-medium ${
                pagination.page === pagination.totalPages
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded text-sm font-medium ${
                pagination.page === pagination.totalPages
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InventoryList;