import common from 'common';
import notificationModel from '../models/notificationModel.js';

const { Notification, notificationRepository } = notificationModel;

export default async function HandleOrderCreated(orderCreated) {

    var notificationData = {
        id: orderCreated.id,
        orderItems: orderCreated.orderItems,
        user: orderCreated.user,
        shipping: orderCreated.shipping,
    };

    await notificationRepository.createNewAsync({
        user: notificationData.user,
        message: `New order created with id ${notificationData.id}`,
        read: false,
        type: 'OrderCreated',
        sourceData: notificationData
    });
}