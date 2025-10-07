import { NextResponse } from 'next/server';

/**
 * Utility functions for API routes
 */

/**
 * Creates a standardized success response
 * @param {any} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 * @returns {NextResponse} Formatted Next.js response
 */
export function successResponse(data, status = 200, message = null) {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Creates a standardized error response
 * @param {string|object} error - Error message or object
 * @param {number} status - HTTP status code (default: 500)
 * @returns {NextResponse} Formatted Next.js response
 */
export function errorResponse(error, status = 500) {
  const response = {
    success: false,
    error: typeof error === 'string' ? error : error.message || 'Unknown error'
  };
  
  // Include validation errors if available
  if (error.errors) {
    response.errors = error.errors;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Handles common MongoDB/Mongoose errors and returns appropriate responses
 * @param {Error} error - The error object
 * @returns {NextResponse} Formatted error response
 */
export function handleDatabaseError(error) {
  // Validation errors
  if (error.name === 'ValidationError') {
    const errors = {};
    for (const field in error.errors) {
      errors[field] = error.errors[field].message;
    }
    return errorResponse({ message: 'Validation failed', errors }, 400);
  }
  
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    return errorResponse(`Duplicate value for ${field}: ${value}`, 409);
  }
  
  // Cast errors (invalid ID format, etc.)
  if (error.name === 'CastError') {
    return errorResponse(`Invalid ${error.path}: ${error.value}`, 400);
  }
  
  // Log unexpected errors
  console.error('Database error:', error);
  
  // Default to 500 server error for unexpected issues
  return errorResponse('Database operation failed', 500);
}

/**
 * Wraps an API handler with error handling
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      return handleDatabaseError(error);
    }
  };
}

/**
 * Extracts and validates query parameters from a request URL
 * @param {Request} request - Next.js request object
 * @param {Object} defaults - Default values for parameters
 * @returns {Object} Parsed and validated query parameters
 */
export function getQueryParams(request, defaults = {}) {
  const { searchParams } = new URL(request.url);
  const params = { ...defaults };
  
  // Extract search parameters
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  // Handle pagination params
  if (params.page) {
    params.page = Math.max(1, parseInt(params.page) || 1);
  }
  
  if (params.limit) {
    params.limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  }
  
  return params;
}

/**
 * Creates pagination metadata for list responses
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function getPaginationData(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}