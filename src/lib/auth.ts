import Cookies from 'js-cookie';

export const setAuthToken = () => {
  Cookies.set('isAdminAuthenticated', 'true', {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const clearAuthToken = () => {
  Cookies.remove('isAdminAuthenticated');
};

export const isAuthenticated = () => {
  return Cookies.get('isAdminAuthenticated') === 'true';
}; 