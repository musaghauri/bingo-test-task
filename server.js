const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const roomId = "BINGO_GAME"
const ALLOWED_USERS = 2
const users = [];

// User leaves game
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0]
}

nextApp.prepare().then(() => {
  app.all("*", (req, res) => nextHandler(req, res));
  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

// Run when client connects
io.on('connection', socket => {
  socket.roomId = roomId
  socket.join(roomId);

  socket.on('joinRoom', ({ user, roomId }, callBack) => {
    if (users.length === ALLOWED_USERS) { // to allow only two players
      socket.emit('redirect', '/404');
      return false
    }

    // to store users count at run time
    users.push({ id: socket.id, user, room: roomId })
    socket.join(roomId);

    // Broadcast when a user connects to get board entries
    socket.broadcast.to(roomId).emit('sendYourBoard');
    // Send users to set the isTurn state
    io.to(roomId).emit('users', users);

    callBack()
  });

  socket.on('pickedBox', (roomId, index) => socket.to(roomId).emit('pickedBox', index));
  socket.on("rivalEntries", (roomId, entries) => socket.to(roomId).emit('rivalEntries', entries))
  socket.on("badLuck", (roomId) => socket.to(roomId).emit('badLuck'))
  socket.on('allowedValue', allowedValue => socket.to(roomId).emit('allowedValue', allowedValue))
  socket.on('setTurn', turn => socket.to(roomId).emit('setTurn', turn))
  socket.on("rematch", () => io.to(roomId).emit('rematch'))

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) io.to(roomId).emit('oponentLeft')
  });

});
