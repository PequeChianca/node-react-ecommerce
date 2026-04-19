import common from 'common';
import registeredUserModel from '../models/registeredUserModel.js';
import notificationModel from '../models/notificationModel.js';
import { addClient, removeClient } from '../sse-manager.js';


const { RegisteredUser, registeredUsersRepository } = registeredUserModel;
const { Notification, notificationRepository } = notificationModel;
const { isAuth, CreateAppRouter } = common;

const router = CreateAppRouter();

router.get('/', isAuth, async (req, res) => {
    const notifications = await notificationRepository.find({ 'deliveryTo.id': req.user._id });
    res.json(notifications);
});

router.put('/:id/read', isAuth, async (req, res) => {
    const notification = await notificationRepository.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (String(notification.deliveryTo.id) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    notification.read = true;

    await notification.save();

    res.json({ success: true });
});

// SSE stream endpoint for real-time notifications.
// EventSource does not support custom headers, so the JWT token is accepted
// via the ?token query parameter and injected into the Authorization header
// before passing to the isAuth middleware.
router.get('/stream',
    (req, res, next) => {
        if (req.query.token) {
            req.headers.authorization = `Bearer ${req.query.token}`;
        }
        next();
    },
    isAuth,
    (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        // Send an initial heartbeat so the client knows the connection is live
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

        connectUser(req.user, res);

        req.on('close', () => disconnectUser(req.user, res));
    }
);

async function connectUser(user, res) {
    await upsertRegisteredUser(user, true);
    addClient(user._id, res);
}

async function disconnectUser(user, res) {
    await upsertRegisteredUser(user, false);
    removeClient(user._id, res);
}

async function upsertRegisteredUser(user, isOnline = false) {
    const existingUser = await registeredUsersRepository.findOne({ _id: user._id });

    if (existingUser) {
        existingUser.name = user.name;
        existingUser.email = user.email;
        existingUser.isAdmin = user.isAdmin;
        existingUser.isOnline = isOnline;

        return await existingUser.save();

    } else {
        return await registeredUsersRepository.createNewAsync({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isOnline: isOnline
        });
    }
}

export default router;
