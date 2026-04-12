import config from 'common';
import orderRoute from './routes/orderRoute.js';

const appDataAccess = new config.AppDataAccess('ecommerce');
appDataAccess.connect();

const appServer = new config.AppServer('Orders', config.PORT);
appServer.registerRoute('/api/orders', orderRoute)
  .registerRoute('/api/config/paypal', (req, res) => {
    res.send(config.PAYPAL_CLIENT_ID);
  }).startServer();
