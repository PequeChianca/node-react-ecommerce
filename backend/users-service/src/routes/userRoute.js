import common from 'common';
import userModel from '../models/userModel.js';

const User = userModel.User;
const userRepository = userModel.userRepository;

const { getToken, isAuth, CreateAppRouter } = common;

const router = CreateAppRouter();

router.put('/:id', isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await userRepository.findById(userId);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: getToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: 'User Not Found' });
  }
});

router.post('/signin', async (req, res) => {
  const signinUser = await userRepository.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (signinUser) {
    res.send({
      _id: signinUser.id,
      name: signinUser.name,
      email: signinUser.email,
      isAdmin: signinUser.isAdmin,
      token: getToken(signinUser),
    });
  } else {
    res.status(401).send({ message: 'Invalid Email or Password.' });
  }
});

router.post('/register', async (req, res) => {

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  await newUser.save();

  if (newUser) {
    res.send({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      token: getToken(newUser),
    });
  } else {
    res.status(401).send({ message: 'Invalid User Data.' });
  }
});

router.get('/createadmin', async (req, res) => {
  try {

    const newUser = new User({
      name: 'Basir',
      email: 'admin@example.com',
      password: '1234',
      isAdmin: true,
    });

    await newUser.save();

    res.send(newUser);

  } catch (error) {
    res.send({ message: error.message });
  }
});

export default router;
