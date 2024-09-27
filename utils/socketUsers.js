let users = [];

const addUser = (socketId, userId, roomId) => {
    const user = { socketId, userId, roomId };
    users.push(user);
    return user;
};

const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

module.exports = { addUser, removeUser, getUser };
