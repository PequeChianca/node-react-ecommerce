import common from 'common';

const reviewsSchema = common.AppDataRepository.createSchema(
  {
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const imageSchema = common.AppDataRepository.createSchema(
  {
    url: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

const productsRepository = new common.AppDataRepository('Product',
  {
    name: { type: String, required: true },
    image: { type: imageSchema, required: true },
    brand: { type: String, required: true },
    price: { type: Number, default: 0, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, default: 0, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 0, required: true },
    numReviews: { type: Number, default: 0, required: true },
    reviews: [reviewsSchema],
  },
  {
    timestamps: true,
  }
);

export default { productsRepository: productsRepository, Product: productsRepository.exportModel() };
