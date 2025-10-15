"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ArchivedItemsModal = ({ onClose, currentUser, onRestore }) => {
  const [archivedItems, setArchivedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [restoreConfirm, setRestoreConfirm] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchArchivedItems();
  }, [searchTerm]);

  const fetchArchivedItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/inventory/archived?search=${searchTerm}`);
      const data = await response.json();
      
      if (data.success) {
        setArchivedItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching archived items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (item) => {
    setIsRestoring(true);
    try {
      const response = await fetch(`/api/inventory/${item._id}/restore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.fullName || currentUser?.username || 'Unknown User'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setArchivedItems(archivedItems.filter(i => i._id !== item._id));
        setRestoreConfirm(null);
        onRestore && onRestore();
      } else {
        throw new Error(data.error || 'Failed to restore item');
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item: ' + error.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "In Stock": return "bg-green-100 text-green-800 border-green-200";
      case "Low Stock": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-orange-900/20 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-500/10 p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Archived Items</h2>
                <p className="text-sm text-gray-400">
                  {isLoading ? 'Loading...' : `${archivedItems.length} archived ${archivedItems.length === 1 ? 'item' : 'items'}`}
                </p>
              </div>
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
        </div>

        {/* Search */}
        <div className="px-6 py-4 bg-gray-900/30 border-b border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search archived items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">Loading archived items...</p>
              </div>
            </div>
          ) : archivedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-800/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Archived Items</h3>
              <p className="text-gray-400">
                {searchTerm ? 'No archived items match your search' : 'You haven\'t archived any items yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-orange-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{item.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="text-white font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="text-white font-medium">{item.category}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-700">
                    Archived {item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : 'Unknown'}
                    {item.archivedBy && ` by ${item.archivedBy}`}
                  </div>

                  <button
                    onClick={() => setRestoreConfirm(item)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Restore Confirmation */}
        <AnimatePresence>
          {restoreConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setRestoreConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Restore Item
                </h3>
                
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to restore <span className="text-white font-medium">{restoreConfirm.name}</span>? 
                  It will be moved back to your active inventory.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setRestoreConfirm(null)}
                    disabled={isRestoring}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRestore(restoreConfirm)}
                    disabled={isRestoring}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isRestoring ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Restoring...
                      </>
                    ) : (
                      'Restore'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ArchivedItemsModal;