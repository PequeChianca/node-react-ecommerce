import OrderPaidMessage from '../messages/order-paid.js';
import OrderCreatedMessage from '../messages/order-created.js';
import orderModel from '../models/orderModel.js';
import common from 'common';

const { isAdmin, isAuth, publishMessage } = common;

const router = common.CreateAppRouter();

const { Order, orderRepository } = orderModel;

router.get("/", isAuth, async (req, res) => {
  const orders = await orderRepository.find({});
  res.send(orders);
});
router.get("/mine", isAuth, async (req, res) => {
  const orders = await orderRepository.find({ 'user.id': req.user._id });
  res.send(orders);
});

router.get("/:id", isAuth, async (req, res) => {
  const order = await orderRepository.findOne({ _id: req.params.id });
  if (order) {
    res.send(order);
  } else {
    res.status(404).send("Order Not Found.")
  }
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const order = await orderRepository.findOne({ _id: req.params.id });
  if (order) {
    const deletedOrder = await orderRepository.remove({ _id: req.params.id });
    res.send(deletedOrder);
  } else {
    res.status(404).send("Order Not Found.")
  }
});

router.post("/", isAuth, async (req, res) => {
  const newOrder = new Order({
    orderItems: req.body.orderItems,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    shipping: req.body.shipping,
    payment: req.body.payment,
    itemsPrice: req.body.itemsPrice,
    taxPrice: req.body.taxPrice,
    shippingPrice: req.body.shippingPrice,
    totalPrice: req.body.totalPrice,
  });
  const newOrderCreated = await newOrder.save();

  await publishMessage(common.endpoints.NOTIFICATIONS_QUEUE, new OrderCreatedMessage(newOrderCreated));

  res.status(201).send({ message: "New Order Created", data: newOrderCreated });
});

router.put("/:id/pay", isAuth, async (req, res) => {
  const order = await orderRepository.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.payment = {
      paymentMethod: 'paypal',
      paymentResult: {
        payerID: req.body.payerID,
        orderID: req.body.orderID,
        paymentID: req.body.paymentID,
        facilitatorAccessToken: req.body.facilitatorAccessToken
      }
    }
    const updatedOrder = await order.save();
    await publishMessage(common.endpoints.NOTIFICATIONS_QUEUE, new OrderPaidMessage(updatedOrder));
    res.send({ message: 'Order Paid.', order: updatedOrder });
  } else {
    res.status(404).send({ message: 'Order not found.' })
  }
});

export default router;