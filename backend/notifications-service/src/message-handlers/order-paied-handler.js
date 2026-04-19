import common from 'common';
import registeredUserModel from '../models/registeredUserModel.js';
import notificationModel from '../models/notificationModel.js';
import { emitToUser } from '../sse-manager.js';
import { mapUserToNotificationUser } from '../models/mappings/user-mapping.js';
const { RegisteredUser, registeredUsersRepository } = registeredUserModel;
const { Notification, notificationRepository } = notificationModel;

export default async function HandleOrderPaid(orderPaid) {

    var adminUsers = await registeredUsersRepository.find({ isAdmin: true });

    for (const admin of adminUsers) {
        var notificationUser = mapUserToNotificationUser(admin);

        var notificationData = {
            id: orderPaid.id,
            orderItems: orderPaid.orderItems,
            shipping: orderPaid.shipping,
            payment: orderPaid.payment,
            itemsPrice: orderPaid.itemsPrice
        };

        const notification = await notificationRepository.createNewAsync({
            sourceUser: orderPaid.user,
            deliveryTo: notificationUser,
            message: `Order paid with id ${notificationData.id}`,
            read: false,
            type: 'OrderPaid',
            sourceData: notificationData
        });

        emitToUser(notificationUser.id, { type: 'notification', payload: notification });
    }
}