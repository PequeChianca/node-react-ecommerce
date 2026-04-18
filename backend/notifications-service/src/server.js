import config from 'common';
import notificationsRoute from './routes/notifications.js';

const appDataAccess = new config.AppDataAccess('notifications');
appDataAccess.connect();

const appServer = new config.AppServer('Notifications', config.PORT);

appServer
.registerRoute('/api/notifications', notificationsRoute)
.startServer();