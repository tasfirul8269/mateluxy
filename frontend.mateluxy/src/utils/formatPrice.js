/**
 * Formats a price value into a more readable format with k (thousands) and M (millions) suffixes
 * @param {number} price - The price to format
 * @param {boolean} showAED - Whether to show the AED currency prefix
 * @returns {string} The formatted price
 */
export const formatPrice = (price, showAED = true) => {
  if (!price && price !== 0) return 'Price on request';
  
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format based on the price value
  let formattedPrice;
  
  if (numPrice >= 1000000) {
    // Format as millions (M)
    formattedPrice = (numPrice / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (numPrice >= 1000) {
    // Format as thousands (k)
    formattedPrice = (numPrice / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    // Format as regular number
    formattedPrice = numPrice.toString();
  }
  
  // Add AED prefix if requested
  return showAED ? `AED ${formattedPrice}` : formattedPrice;
};
