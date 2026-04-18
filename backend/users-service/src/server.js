import config from 'common';
import userRoute from './routes/userRoute.js';

const appDataAccess = new config.AppDataAccess('users');
appDataAccess.connect();

const appServer = new config.AppServer('Users', config.PORT);
appServer.registerRoute('/api/users', userRoute).startServer();