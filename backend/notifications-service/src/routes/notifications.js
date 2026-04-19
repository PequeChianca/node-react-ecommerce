import common from 'common';
import notificationModel from '../models/notificationModel.js';

const { Notification, notificationRepository } = notificationModel;

const router = common.CreateAppRouter();

router.get('/', async (req, res) => {
    const notifications = await notificationRepository.find({});
    res.json(notifications);
});

export default router;
