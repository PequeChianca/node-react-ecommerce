import { CreateAppRouter } from './app-server.js';

const router = CreateAppRouter();

router.get('/', (req, res) => {
    res.send({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
