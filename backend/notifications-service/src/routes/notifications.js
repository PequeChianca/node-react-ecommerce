import common from 'common';
import registeredUserModel from '../models/registeredUserModel.js';
import notificationModel from '../models/notificationModel.js';
import { addClient, removeClient, emitToUser } from '../sse-manager.js';


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
    async (req, res) => {
        res.writeHead(200, {
            // 'text/event-stream': Standard MIME type for SSE
            // Tells browser to handle this response as EventSource
            'Content-Type': 'text/event-stream',

            // 'no-cache': Prevents proxies or browsers from caching response
            // Essential for SSE as it's real-time data
            'Cache-Control': 'no-cache',

            // 'keep-alive': Maintains HTTP connection
            // Required for SSE to keep connection open for long periods
            'Connection': 'keep-alive',

            // CORS headers - compliance with browser security policies
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true'
        });
        // res.setHeader('X-Accel-Buffering', 'no');
        // res.flushHeaders();

        // Send an initial heartbeat so the client knows the connection is live
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

        // Register the client synchronously so it is available immediately,
        // before any async work (upsertRegisteredUser) completes.
        addClient(req.user._id, res);
        req.on('close', () => {
            removeClient(req.user._id, res);
            upsertRegisteredUser(req.user, false).catch((err) =>
                console.error('upsertRegisteredUser (offline) error:', err)
            );
        });

        // Upsert the registered-user record in the background (non-blocking).
        await upsertRegisteredUser(req.user, true).catch((err) =>
            console.error('upsertRegisteredUser error:', err)
        );        
    }
);

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
