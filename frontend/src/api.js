import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const logActivity = (data) => api.post('/api/activities/log', data);
export const previewEmissions = (params) => api.get('/api/activities/preview', { params });
export const getHistory = (user_id = 1, limit = 10) =>
  api.get('/api/activities/history', { params: { user_id, limit } });

export const getDashboardSummary = (user_id = 1) =>
  api.get('/api/dashboard/summary', { params: { user_id } });
export const getDashboardChart = (user_id = 1, period = 'weekly') =>
  api.get('/api/dashboard/chart', { params: { user_id, period } });
export const addGoal = (goal, user_id = 1) =>
  api.post('/api/dashboard/goals', goal, { params: { user_id } });
export const deleteGoal = (goal_id) => api.delete(`/api/dashboard/goals/${goal_id}`);

export const getSocialStats = (user_id = 1) =>
  api.get('/api/social/stats', { params: { user_id } });
export const getLeaderboard = (user_id = 1) =>
  api.get('/api/social/leaderboard', { params: { user_id } });
export const getMostImproved = () => api.get('/api/social/most-improved');
export const addFriend = (friend_username, user_id = 1) =>
  api.post('/api/social/friends/add', null, { params: { friend_username, user_id } });

export const getTips = (category = 'all') =>
  api.get('/api/tips', { params: { category } });

export const getProfile = (user_id = 1) =>
  api.get('/api/profile', { params: { user_id } });
export const addProfileGoal = (goal, user_id = 1) =>
  api.post('/api/profile/goals', goal, { params: { user_id } });

export default api;
