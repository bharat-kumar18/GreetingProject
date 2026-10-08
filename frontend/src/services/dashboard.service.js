import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  // API interceptor returns the data object, which looks like { success: true, data: { ... } }
  return response.data;
};
