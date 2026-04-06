import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from 'common';
import productRoute from './routes/productRoute.js';
import uploadRoute from './routes/uploadRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api/uploads', uploadRoute);
app.use('/api/products', productRoute);
app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));

app.listen(config.PORT, () => {
  console.log(`Server started at http://localhost:${config.PORT}`);
});
