import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
    },
    notificationReceived(state, action) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllReadLocally(state) {
      state.items = state.items.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, notificationReceived, markAllReadLocally } = notificationsSlice.actions;
export default notificationsSlice.reducer;
