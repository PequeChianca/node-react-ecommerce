export function mapUserToNotificationUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    };
}