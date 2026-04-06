import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from 'common';
import userRoute from './routes/userRoute.js';

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
app.use('/api/users', userRoute);

app.listen(config.PORT, () => {
  console.log(`Server started at http://localhost:${config.PORT}`);
});
