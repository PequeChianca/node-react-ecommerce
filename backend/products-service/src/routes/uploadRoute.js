import common from 'common';
import { upload, uploadBufferToAzure } from '../infrastructure/file-storage.js';

const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER || 'images';

const router = common.CreateAppRouter();


router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }
    const url = await uploadBufferToAzure(CONTAINER_NAME, req.file.buffer, req.file.originalname, req.file.mimetype);
    res.send({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Upload failed', error: err.message });
  }
});


export default router;
