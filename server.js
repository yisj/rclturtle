const express = require('express');
const app = express();
const rclnodejs = require('rclnodejs');
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

let node;
let publisher;
let subscription;

rclnodejs.init().then(()=>{
  node = rclnodejs.createNode('rclnodejs_express');
  publisher = node.createPublisher('geometry_msgs/msg/Twist', 'turtle1/cmd_vel');
  subscription = node.createSubscription('turtlesim/msg/Pose', 'turtle1/pose', (msg) => {
    //console.log('Received message:', msg);
    io.sockets.emit("pose",  msg);
  });
  rclnodejs.spin(node);
  console.log('publisher created');
}).catch((err)=>{
  console.log(err);
  console.log('error while init rclnodejs');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});


app.get('/cmd_vel', (req, res) => {
  res.sendFile(__dirname+'/views/cmd_vel.html');
});

app.post('/cmd_vel', (req, res) => {
  console.log(req.body);
  publisher.publish(req.body);
});

app.get('/arrow', (req, res) => {
  res.sendFile(__dirname+'/views/arrow.html');
});

app.post('/arrow', (req, res) => {
  console.log(req.body);
  res.send(req.body);  
  switch (req.body.arrow) {
    case 'up':
      console.log('move turtle up');
      publisher.publish({linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 0.0}});
      break;
    case 'down':
      console.log('move turtle down');
      publisher.publish({linear: {x: -2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 0.0}});
      break;
    case 'left':
      console.log('move turtle left');
      publisher.publish({linear: {x: 0.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 2.0}});
      break;
    case 'right':
      console.log('move turtle right');
      publisher.publish({linear: {x: 0.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: -2.0}});
      break;
    default:
      console.log('do not move');
  }
});

app.get('/arrow-with-map', (req, res) => {
  res.sendFile(__dirname+'/views/arrow_with_map.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', ()=> {
    console.log('  user disconnected');
  });
});

server.listen(3333, ()=>{
  console.log('SERVER LISTENING ON 3333');
});
