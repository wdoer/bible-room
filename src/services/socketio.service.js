import { io } from 'socket.io-client';

class SocketService {
  socket;
  constructor() {}  

  connection() {  
    this.socket = io(process.env.VUE_APP_SOCKET_ENDPOINT);  
  
    // this.socket.emit('message', 'Hello there from Vue.');
  }

  getBack() {
    this.socket.on('back', (data) => {
      return data;
    })
  }

  viewVerses(data) {
    this.socket.emit('message', data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService()