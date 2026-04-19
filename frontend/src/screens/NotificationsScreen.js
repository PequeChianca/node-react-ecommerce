import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../actions/notificationActions';

function NotificationsScreen() {
  const dispatch = useDispatch();
  const { loading, notifications, error } = useSelector(
    (state) => state.notificationList
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="content content-margined">
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n._id} className={`notification-item${n.read ? ' read' : ' unread'}`}>
              <span className="notification-message">{n.message}</span>
              <span className="notification-type">{n.type}</span>
              {!n.read && (
                <button
                  className="button secondary"
                  onClick={() => handleMarkRead(n._id)}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsScreen;
