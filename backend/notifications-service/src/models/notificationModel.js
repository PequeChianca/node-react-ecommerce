import common from 'common';

const userSchema = common.GetUsersSchema();

const notificationRepository = new common.AppDataRepository('Notification', {
    user: { type: userSchema, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
});

const Notification = notificationRepository.exportModel();

export default { Notification: Notification, notificationRepository: notificationRepository };  