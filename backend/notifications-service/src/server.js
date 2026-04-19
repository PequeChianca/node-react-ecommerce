import config from 'common';
import HandleOrderCreated from './message-handlers/order-created-handler.js';
import notificationsRoute from './routes/notifications.js';

const appDataAccess = new config.AppDataAccess('notifications');
appDataAccess.connect();

const appServer = new config.AppServer('Notifications', config.PORT);


const messageConsumer = new config.MessageConsumer(config.endpoints.NOTIFICATIONS_QUEUE);

await messageConsumer
    .registerHandler('ORDER_CREATED', async (payload) => {
        await HandleOrderCreated(payload);
    }).start();
    
appServer
    .registerRoute('/api/notifications', notificationsRoute)
    .startServer();