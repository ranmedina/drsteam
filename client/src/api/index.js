export const SERVER_HOST =
  process.env.NODE_ENV === 'production' ? `https://${process.env.REACT_APP_BACKEND_URL}` : 'http://localhost:3001';
