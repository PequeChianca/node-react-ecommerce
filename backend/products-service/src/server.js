
import config from 'common';
import productRoute from './routes/productRoute.js';
import uploadRoute from './routes/uploadRoute.js';

const appDataAccess = new config.AppDataAccess('products');
appDataAccess.connect();

const appServer = new config.AppServer('Products', config.PORT);
appServer.registerRoute('/api/uploads', uploadRoute);
appServer.registerRoute('/api/products', productRoute);

appServer.startServer();