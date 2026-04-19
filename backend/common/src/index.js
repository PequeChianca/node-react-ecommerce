import util from './util.js';
import config from './config.js';
import { AppServer, CreateAppRouter } from './server/app-server.js';
import { AppDataAccess } from './data-layer/app-data-access.js';
import { AppDataRepository } from './data-layer/app-data-repository.js';
import { publishMessage } from './messages/message-publisher.js';
import { MessageConsumer } from './messages/message-consumer.js';


export default {
  ...util,
  ...config,
  AppServer,
  CreateAppRouter,
  AppDataAccess,
  AppDataRepository,
  publishMessage,
  MessageConsumer,
  endpoints: {
    ORDERS_QUEUE: 'orders-service',
    NOTIFICATIONS_QUEUE: 'notifications-service',
  }
};