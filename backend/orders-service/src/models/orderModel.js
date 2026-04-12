import common from 'common';

const shippingSchema = {
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
};

const paymentSchema = {
  paymentMethod: { type: String, required: true }
};

const orderItemSchema = common.AppDataRepository.createSchema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  product: {
    type: common.AppDataRepository.Types.ObjectId,
    ref: 'Product',
    required: true
  },
});

const orderSchema = common.AppDataRepository.createSchema({
  user: { type: common.AppDataRepository.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shipping: shippingSchema,
  payment: paymentSchema,
  itemsPrice: { type: Number },
  taxPrice: { type: Number },
  shippingPrice: { type: Number },
  totalPrice: { type: Number },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
}, {
  timestamps: true
});

const orderRepository = new common.AppDataRepository('Order', orderSchema);

export default { orderRepository, Order: orderRepository.exportModel() };