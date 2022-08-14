const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {cors: 'localhost:8080'});

app.get('/', (req, res) => {
  res.send('<h1>Process...</h1>');
});

io.on('connection', (socket) => {
  
  console.log('connected');
  
  socket.on('disconnect', () => {
    console.log('disconnected');
  });
  
  socket.on('message', (msg) => {
    console.log('message: ' + msg);
    io.emit('back', msg);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
