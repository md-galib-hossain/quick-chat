import { Server } from "socket.io";
import Redis from "ioredis";
const pub = new Redis({
  host:process.env.REDIS_HOST,
  port:Number(process.env.REDIS_PORT),
  username:process.env.REDIS_USERNAME,
  password:process.env.REDIS_PASSWORD
});
const sub = new Redis({
  host:process.env.REDIS_HOST,
  port:Number(process.env.REDIS_PORT),
  username:process.env.REDIS_USERNAME,
  password:process.env.REDIS_PASSWORD
});
class SocketService {
  private _io: Server;
  constructor() {
    console.log("Init Socket Server...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe('MESSAGES')

  }
  public initListeners() {
    console.log(`Initialized socket listeners`);
    const io = this.io;
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log(`New Message Recieved`, message);
        // publish this message to redis
        await pub.publish('MESSAGES',
          JSON.stringify({message})
        )
      });
    });
    sub.on('message',(channel,message)=> {
      if(channel === 'MESSAGES'){
        io.emit('message',message)
      }
    })
  }

  get io() {
    return this._io;
  }
}
export default SocketService;
