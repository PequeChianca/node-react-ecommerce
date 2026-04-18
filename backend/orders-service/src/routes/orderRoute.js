import orderModel from '../models/orderModel.js';
import common from 'common';

const { isAdmin, isAuth, publishMessage } = common;

const router = common.CreateAppRouter();

const { Order, orderRepository } = orderModel;

router.get("/", isAuth, async (req, res) => {
  const orders = await orderRepository.find({}).populate('user');
  res.send(orders);
});
router.get("/mine", isAuth, async (req, res) => {
  const orders = await orderRepository.find({ user: req.user._id });
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
    user: req.user,
    shipping: req.body.shipping,
    payment: req.body.payment,
    itemsPrice: req.body.itemsPrice,
    taxPrice: req.body.taxPrice,
    shippingPrice: req.body.shippingPrice,
    totalPrice: req.body.totalPrice,
  });
  const newOrderCreated = await newOrder.save();

  await publishMessage("orders-service", { type: "ORDER_CREATED", payload: newOrderCreated });
  
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
        paymentID: req.body.paymentID
      }
    }
    const updatedOrder = await order.save();
    await publishMessage("orders-service", { type: "ORDER_PAID", payload: updatedOrder });
    res.send({ message: 'Order Paid.', order: updatedOrder });
  } else {
    res.status(404).send({ message: 'Order not found.' })
  }
});

export default router;