const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const generateReference = (prefix = 'TXN') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

module.exports = { formatCurrency, formatDate, generateReference };