import Axios from 'axios';
import {
  NOTIFICATIONS_LIST_REQUEST,
  NOTIFICATIONS_LIST_SUCCESS,
  NOTIFICATIONS_LIST_FAIL,
  NOTIFICATION_RECEIVED,
  NOTIFICATIONS_MARK_READ,
} from '../constants/notificationConstants';

// Holds the active EventSource so we can close it on sign-out
let notificationEventSource = null;

export const fetchNotifications = () => async (dispatch, getState) => {
  try {
    dispatch({ type: NOTIFICATIONS_LIST_REQUEST });
    const { userSignin: { userInfo } } = getState();
    const { data } = await Axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: NOTIFICATIONS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: NOTIFICATIONS_LIST_FAIL, payload: error.message });
  }
};

export const startNotificationStream = () => (dispatch, getState) => {
  console.log('Starting notification stream');
  if (notificationEventSource){
    console.log('Notification stream already active, skipping');
     return; // already connected
  }

  const { userSignin: { userInfo } } = getState();
  if (!userInfo) return;

  // Connect directly to the API gateway (port 5000) to bypass the CRA dev
  // server proxy, which buffers streaming responses and blocks SSE.
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const url = `${apiBase}/api/notifications/stream?token=${encodeURIComponent(userInfo.token)}`;
  notificationEventSource = new EventSource(url);

  notificationEventSource.onopen = () => {
    console.log('Notification stream connected');
  };

  notificationEventSource.onmessage = (event) => {
    const parsed = JSON.parse(event.data);
    if (parsed.type === 'notification') {
      dispatch({ type: NOTIFICATION_RECEIVED, payload: parsed.payload });
    }
  };

  notificationEventSource.onerror = () => {
    notificationEventSource.close();
    notificationEventSource = null;
  };
};

export const stopNotificationStream = () => () => {
  if (notificationEventSource) {
    notificationEventSource.close();
    notificationEventSource = null;
  }
};

export const markNotificationRead = (notificationId) => async (dispatch, getState) => {
  try {
    const { userSignin: { userInfo } } = getState();
    await Axios.put(`/api/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    });
    dispatch({ type: NOTIFICATIONS_MARK_READ, payload: notificationId });
  } catch (_) {
    // non-critical – optimistically mark as read in UI anyway
    dispatch({ type: NOTIFICATIONS_MARK_READ, payload: notificationId });
  }
};
