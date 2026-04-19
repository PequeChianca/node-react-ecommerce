import config from 'common';
import HandleOrderPaid from './message-handlers/order-paied-handler.js';
import HandleOrderCreated from './message-handlers/order-created-handler.js';
import notificationsRoute from './routes/notifications.js';

const appDataAccess = new config.AppDataAccess('notifications');
appDataAccess.connect();

const appServer = new config.AppServer('Notifications', config.PORT);


const messageConsumer = new config.MessageConsumer(config.endpoints.NOTIFICATIONS_QUEUE);

// Register message handlers for different message types
await messageConsumer.registerHandler('ORDER_CREATED', HandleOrderCreated)
                     .registerHandler('ORDER_PAID', HandleOrderPaid)
                     .start();

appServer
    .registerRoute('/api/notifications', notificationsRoute)
    .startServer();