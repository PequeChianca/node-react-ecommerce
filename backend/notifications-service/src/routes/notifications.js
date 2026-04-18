import common from 'common';

const router = common.CreateAppRouter();

router.get('/notifications', (req, res) => {
    res.json({ message: 'Notifications endpoint' });
});

export default router;
