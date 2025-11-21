/**
 * Utility Functions for TinyLink Application
 * Contains validation and helper functions
 */


export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Check if protocol is http or https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates if a code matches the required pattern [A-Za-z0-9]{6,8}
 * @param code - The short code to validate
 * @returns true if valid code format, false otherwise
 */
export function isValidCode(code: string): boolean {
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}

/**
 * Generates a random alphanumeric code
 * @param length - Length of code to generate (default: 6)
 * @returns Random alphanumeric string
 */
export function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formats a date to a readable string
 * @param date - Date to format
 * @returns Formatted date string or 'Never' if null
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Truncates a long URL for display
 * @param url - URL to truncate
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated URL with ellipsis
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}
