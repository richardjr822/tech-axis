import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const InventoryForm = ({ 
  formMode, 
  formData, 
  onSubmit,
  onCancel,
  errors = {},
  categories = []
}) => {
  const [form, setForm] = useState(formData);
  const [isDirty, setIsDirty] = useState(false);
  
  // Fixed categories with icons
  const fixedCategories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Peripherals', icon: '🖱️' },
    { name: 'Storage', icon: '💾' },
    { name: 'Audio', icon: '🎧' },
    { name: 'Cables', icon: '🔌' },
    { name: 'Software', icon: '📀' }
  ];
  
  useEffect(() => {
    // When adding new item, set quantity to 1 and status to In Stock
    if (formMode === 'add') {
      setForm({
        ...formData,
        quantity: 1,
        status: 'In Stock'
      });
    } else {
      setForm(formData);
    }
    setIsDirty(false);
  }, [formData, formMode]);
  
  // Function to determine status based on quantity
  const getStatusFromQuantity = (quantity) => {
    const qty = Number(quantity);
    if (qty === 0) return 'Out of Stock';
    if (qty <= 5) return 'Low Stock';
    return 'In Stock';
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    
    // Handle quantity changes
    if (name === 'quantity') {
      newValue = value === '' ? 0 : parseInt(value);
      // Automatically update status based on quantity
      const newStatus = getStatusFromQuantity(newValue);
      setForm(prev => ({
        ...prev,
        quantity: newValue,
        status: newStatus
      }));
      setIsDirty(true);
      return;
    }
    
    // Handle description with 500 character limit
    if (name === 'description') {
      if (value.length > 500) {
        return; // Don't update if exceeds 500 characters
      }
      newValue = value;
    }
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value)) : newValue
    }));
    
    setIsDirty(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure status is set based on quantity before submitting
    const finalForm = {
      ...form,
      status: getStatusFromQuantity(form.quantity)
    };
    onSubmit(finalForm);
  };

  const getCategoryIcon = (categoryName) => {
    const category = fixedCategories.find(c => c.name === categoryName);
    return category ? category.icon : '📦';
  };
  
  const remainingChars = 500 - (form.description?.length || 0);
  const isNearLimit = remainingChars <= 50;
  
  const isFormValid = () => {
    return (
      form.name &&
      form.name.trim().length > 0 &&
      typeof form.quantity === 'number' &&
      form.quantity >= 0 &&
      form.category &&
      form.category.trim().length > 0 &&
      form.description &&
      form.description.trim().length > 0
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 backdrop-blur-xl max-h-[90vh] overflow-y-auto"
    >
      {/* Enhanced Header with gradient */}
      <div className="sticky top-0 z-10 relative px-6 py-5 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 via-gray-900 to-orange-900/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-50"></div>
        <div className="relative flex justify-between items-center">
          <div className="flex items-center">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                {formMode === 'edit' ? (
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                ) : (
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                )}
              </svg>
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {formMode === 'edit' ? 'Edit Item' : 'Add New Item'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {formMode === 'edit' ? 'Update item information' : 'Fill in the details below'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-800 rounded-lg p-2 group"
          >
            <svg className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Name */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2 md:col-span-1"
          >
            <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Item Name <span className="text-orange-500 ml-1">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full bg-gray-900/50 border-2 ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-gray-800 focus:border-orange-500 group-hover:border-gray-700'
                } rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 backdrop-blur-sm`}
                placeholder="e.g., Logitech G502 Gaming Mouse"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Quantity */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-2 md:col-span-1"
          >
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Quantity <span className="text-orange-500 ml-1">*</span>
            </label>
            <div className="relative group">
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className={`w-full bg-gray-900/50 border-2 ${
                  errors.quantity 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-gray-800 focus:border-orange-500 group-hover:border-gray-700'
                } rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 backdrop-blur-sm`}
                placeholder="1"
                min="0"
              />
              <AnimatePresence>
                {errors.quantity && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.quantity}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Category Dropdown */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2 md:col-span-1"
          >
            <label htmlFor="category" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Category <span className="text-orange-500 ml-1">*</span>
            </label>
            <div className="relative group">
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full bg-gray-900/50 border-2 ${
                  errors.category 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-gray-800 focus:border-orange-500 group-hover:border-gray-700'
                } rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 appearance-none cursor-pointer backdrop-blur-sm`}
                style={{ 
                  scrollbarWidth: 'thin', 
                  scrollbarColor: '#f97316 #1f2937'
                }}
              >
                <option value="" className="bg-gray-900 py-2">Select a category...</option>
                {fixedCategories.map((cat, index) => (
                  <option key={index} value={cat.name} className="bg-gray-900 py-3 hover:bg-gray-800">
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              
              {/* Custom dropdown arrow and icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                {form.category && (
                  <span className="mr-2 text-lg">{getCategoryIcon(form.category)}</span>
                )}
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              <AnimatePresence>
                {errors.category && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.category}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Status - Auto-calculated, Read-only */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-2 md:col-span-1"
          >
            <label htmlFor="status" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Status <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
            </label>
            <div className="relative group">
              <div className="w-full bg-gray-900/50 border-2 border-gray-800 rounded-xl px-4 py-3 text-white flex items-center justify-between cursor-not-allowed opacity-75">
                <span className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    form.status === 'In Stock' ? 'bg-green-500' :
                    form.status === 'Low Stock' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  {form.status === 'In Stock' && '✓ In Stock'}
                  {form.status === 'Low Stock' && '⚠ Low Stock'}
                  {form.status === 'Out of Stock' && '✗ Out of Stock'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Status updates automatically based on quantity
              </p>
            </div>
          </motion.div>
          
          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-2"
          >
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Description <span className="text-orange-500 ml-1">*</span>
            </label>
            <div className="relative group">
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                maxLength="500"
                className={`w-full bg-gray-900/50 border-2 ${
                  errors.description 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-gray-800 focus:border-orange-500 group-hover:border-gray-700'
                } rounded-xl px-4 py-3 pb-8 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 resize-none backdrop-blur-sm`}
                placeholder="Provide a detailed description of the item (features, specifications, condition, etc.)..."
              ></textarea>
              <div className={`absolute bottom-3 right-3 text-xs flex items-center gap-2 ${
                isNearLimit ? 'text-orange-500' : 'text-gray-500'
              }`}>
                <span className={isNearLimit ? 'font-semibold' : ''}>
                  {form.description?.length || 0}
                </span>
                <span>/</span>
                <span className="text-gray-600">500</span>
                {isNearLimit && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <AnimatePresence>
                {errors.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pt-6 border-t border-gray-800/50 flex flex-col-reverse sm:flex-row justify-end gap-3"
        >
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-800 transition-all duration-300 flex-1 sm:flex-none font-medium border border-gray-700 hover:border-gray-600 group"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </span>
          </button>
          <button
            type="submit"
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex-1 sm:flex-none flex items-center justify-center font-medium shadow-lg ${
              !isDirty || !isFormValid()
                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-0.5 border border-orange-500'
            }`}
            disabled={!isDirty || !isFormValid()}
          >
            {formMode === 'edit' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
                </svg>
                Update Item
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Item
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default InventoryForm;