import common from 'common';

const registeredUsersRepository = new common.AppDataRepository('RegisteredUser', {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isOnline: { type: Boolean, required: true, default: false },
});

const RegisteredUser = registeredUsersRepository.exportModel();

export default { RegisteredUser: RegisteredUser, registeredUsersRepository: registeredUsersRepository };  