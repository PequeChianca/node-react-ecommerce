import common from 'common';

const userSchema = common.AppDataRepository.getUserSchema();

const notificationRepository = new common.AppDataRepository('Notification', {
    user: { type: userSchema, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
    sourceData: { type: Object, required: false },
});

const Notification = notificationRepository.exportModel();

export default { Notification: Notification, notificationRepository: notificationRepository };  