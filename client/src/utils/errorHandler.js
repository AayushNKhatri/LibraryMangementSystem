/**
 * Utility functions for error handling in the application
 */

/**
 * Parses an error response from the API and returns a user-friendly message
 * @param {any} error - The error object from axios or other sources
 * @returns {string} A user-friendly error message
 */
export const parseApiError = (error) => {
  // No error provided
  if (!error) return 'An unknown error occurred';

  // Handle axios error responses
  if (error.response) {
    const { data, status } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        return formatErrorMessage(data) || 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return formatErrorMessage(data) || `Error: ${status}`;
    }
  }

  // Handle network errors
  if (error.request) {
    return 'Could not connect to the server. Please check your internet connection.';
  }

  // Handle other errors
  return error.message || 'An unexpected error occurred';
};

/**
 * Formats error message from different response formats
 * @param {any} data - The error data from response
 * @returns {string} Formatted error message
 */
const formatErrorMessage = (data) => {
  if (!data) return null;

  // If data is a string, clean it up
  if (typeof data === 'string') {
    // Remove stack traces
    if (data.includes('System.Exception')) {
      const matches = data.match(/System\.Exception: (.+?)(\r\n|\n|$)/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
    return data;
  }

  // If data has error or message property
  if (data.error) return data.error;
  if (data.message) return data.message;
  if (data.title) return data.title;

  // For .NET validation errors
  if (data.errors) {
    const firstError = Object.values(data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }

  // For other object formats, stringify
  return JSON.stringify(data);
};

/**
 * Logs errors to console with better formatting
 * @param {any} error - The error to log
 * @param {string} context - Optional context for where the error occurred
 */
export const logError = (error, context = '') => {
  const contextText = context ? `[${context}] ` : '';

  console.error(`${contextText}Error:`, error);

  if (error.response) {
    console.error(`${contextText}Status:`, error.response.status);
    console.error(`${contextText}Data:`, error.response.data);
  }
};

export default {
  parseApiError,
  logError
};
