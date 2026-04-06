import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from 'common';
import orderRoute from './routes/orderRoute.js';

const mongodbUrl = config.MONGODB_URL;
mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((error) => console.log(error.reason));

const app = express();
app.use(bodyParser.json());
app.use('/api/orders', orderRoute);
app.get('/api/config/paypal', (req, res) => {
  res.send(config.PAYPAL_CLIENT_ID);
});

app.listen(config.PORT, () => {
  console.log(`Server started at http://localhost:${config.PORT}`);
});
