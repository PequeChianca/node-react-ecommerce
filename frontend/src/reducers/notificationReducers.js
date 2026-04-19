import {
  NOTIFICATIONS_LIST_REQUEST,
  NOTIFICATIONS_LIST_SUCCESS,
  NOTIFICATIONS_LIST_FAIL,
  NOTIFICATION_RECEIVED,
  NOTIFICATIONS_MARK_READ,
} from '../constants/notificationConstants';

export function notificationListReducer(
  state = { loading: false, notifications: [], error: null },
  action
) {
  switch (action.type) {
    case NOTIFICATIONS_LIST_REQUEST:
      return { ...state, loading: true };
    case NOTIFICATIONS_LIST_SUCCESS:
      return { loading: false, notifications: action.payload, error: null };
    case NOTIFICATIONS_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    case NOTIFICATION_RECEIVED:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case NOTIFICATIONS_MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n._id === action.payload ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}
