import common from 'common';

const userRepository = new common.AppDataRepository('User', {
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true, index: true, dropDups: true,
  },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
});

const User = userRepository.exportModel();

export default { User: User, userRepository: userRepository };
