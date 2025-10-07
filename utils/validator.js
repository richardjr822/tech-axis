/**
 * Utility functions for validating input data
 */

/**
 * Validates inventory item data
 * @param {Object} data - Item data to validate
 * @returns {Object} Object with isValid and errors properties
 */
export function validateInventoryItem(data) {
  const errors = {};
  
  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Item name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Item name cannot exceed 100 characters';
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.category = 'Category is required';
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  } else if (data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  
  // Type validation
  if (data.quantity !== undefined) {
    if (isNaN(Number(data.quantity))) {
      errors.quantity = 'Quantity must be a number';
    } else if (Number(data.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
  }
  
  if (data.price !== undefined) {
    if (isNaN(Number(data.price))) {
      errors.price = 'Price must be a number';
    } else if (Number(data.price) < 0) {
      errors.price = 'Price cannot be negative';
    }
  }
  
  // Status validation
  if (data.status && !['In Stock', 'Low Stock', 'Out of Stock'].includes(data.status)) {
    errors.status = 'Status must be one of: In Stock, Low Stock, Out of Stock';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates category data
 * @param {Object} data - Category data to validate
 * @returns {Object} Object with isValid and errors properties
 */
export function validateCategory(data) {
  const errors = {};
  
  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Category name is required';
  } else if (data.name.length > 50) {
    errors.name = 'Category name cannot exceed 50 characters';
  }
  
  // Optional fields
  if (data.description && data.description.length > 200) {
    errors.description = 'Description cannot exceed 200 characters';
  }
  
  // Color validation
  if (data.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.color)) {
    errors.color = 'Color must be a valid hex color code (e.g. #ff0000)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates search parameters
 * @param {Object} params - Search parameters
 * @returns {Object} Sanitized parameters
 */
export function sanitizeSearchParams(params) {
  const sanitized = { ...params };
  
  // Sanitize page number
  if (sanitized.page) {
    sanitized.page = Math.max(1, parseInt(sanitized.page) || 1);
  }
  
  // Sanitize limit
  if (sanitized.limit) {
    // Cap at reasonable maximum to prevent performance issues
    sanitized.limit = Math.min(100, Math.max(1, parseInt(sanitized.limit) || 10));
  }
  
  // Sanitize sort direction
  if (sanitized.order && !['asc', 'desc'].includes(sanitized.order.toLowerCase())) {
    sanitized.order = 'asc';
  }
  
  return sanitized;
}

/**
 * Checks if a string is a valid MongoDB ObjectId
 * @param {String} id - ID to check
 * @returns {Boolean} True if valid ObjectId format
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Checks if a value is a positive integer
 * @param {any} value - Value to check
 * @returns {Boolean} True if positive integer
 */
export function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}