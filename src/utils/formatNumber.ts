/**
 * Format large numbers for better readability
 * Converts thousands to K and millions to M
 */
export const formatNumber = (num: number): string => {
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (absNum >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toFixed(2);
};

/**
 * Format currency with proper symbol
 */
export const formatCurrency = (num: number, symbol: string = '€'): string => {
  return `${symbol}${formatNumber(num)}`;
};
