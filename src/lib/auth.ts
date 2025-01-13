export const setAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isAdminAuthenticated', 'true');
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAdminAuthenticated');
  }
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  }
  return false;
}; 