
export class OrderCreatedMessage {
    type = "ORDER_CREATED";
    payload;
    
    constructor(order) {
        this.payload = {
            id: order._id,
            orderItems: order.orderItems,
            user: order.user,
            shipping: order.shipping,
        };
    }
} 