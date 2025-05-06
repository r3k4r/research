import { formatDistance, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Gets the appropriate date field from any object that might contain date information
 * @param {Object} item - Object containing date information 
 * @returns {Date|null} - Valid date object or null
 */
export function getValidDate(item) {
  if (!item) return null;
  
  // Check for common date field names
  const dateField = item.createdAt || item.date || item.timestamp;
  if (!dateField) return null;
  
  try {
    const dateObj = new Date(dateField);
    return isValid(dateObj) ? dateObj : null;
  } catch (e) {
    console.error("Invalid date:", dateField);
    return null;
  }
}

/**
 * Formats a date for relative time display with better accuracy
 */
export function formatRelativeTime(dateObj, now = new Date()) {
  if (!dateObj) return "Unknown time";
  
  try {
    // Ensure we're working with date objects
    const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
    
    if (!isValid(date)) return "Invalid date";
    
    // Calculate time difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    
    // Show "just now" for very recent items (less than 60 seconds)
    if (diffMs < 60000) {
      return "just now";
    }
    
    // For future dates (if clock is wrong or for scheduled items)
    if (diffMs < 0) {
      return "scheduled";
    }
    
    // Use more precise formatting with seconds included
    return formatDistance(date, now, { 
      addSuffix: true,
      includeSeconds: true
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Unknown time";
  }
}
