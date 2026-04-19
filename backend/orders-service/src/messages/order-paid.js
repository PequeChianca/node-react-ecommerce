export default class OrderPaidMessage {
    type = "ORDER_PAID";
    payload;
    constructor(order) {
        this.payload = {
            id: order._id,
            orderItems: order.orderItems,
            user: order.user,
            shipping: order.shipping,
            payment: order.payment,
            itemsPrice: order.itemsPrice
        };
    }
}