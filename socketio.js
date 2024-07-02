/*
 * @Author: BINGWU
 * @Date: 2024-06-27 14:27:10
 * @LastEditors: hujiacheng hujiacheng@iipcloud.com
 * @LastEditTime: 2024-07-02 09:42:10
 * @FilePath: \print-serve\socketio.js
 * @Describe: 
 * @Mark: ૮(˶ᵔ ᵕ ᵔ˶)ა
 */
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
// 解决跨域
const io = socketIo(server, {
  cors: {
    origin: "*", // 允许所有的来源
    methods: ["GET", "POST"] // 允许的HTTP方法
  },
  pingInterval: 10000,  // 10秒发送一次ping包
  pingTimeout: 5000    // 5秒内未响应则认为断开
})
app.use(cors())
const port = process.env.PORT || 3000


// 存储客户端的连接和连接状态
/**
 * key: clientId
 * key: {
    socket: socket.io对象
    connected: 客户端是否在线
 *}
 * 
 * 
 */
let clients = {}

app.get("/getStatus", express.json(), (req, res) => {
  const data = []
  for (const clientId in clients) {
    const client = clients[clientId]
    data.push({
      clientId,
      connected: client.connected,
      socketId: client.socket.id
    })
  }
  res.json({
    data
  })
})

app.get("/startPrint", express.json(), (req, res) => {
  const { clientId, printData } = req.query // 存储用户参数
  const targetClient = clients[clientId]
  // 如果客户端存在
  if (targetClient) {
    // 且客户端在线
    if (targetClient.connected) {
      // 收到消息后再返回给客户端
      targetClient.socket.emit('print', {printData})
      res.send({ message: "参数已接收" })
    } else {
      res.send({ message: "打印机离线" })
    }
  } else {
    res.send({ message: "打印机不存在" })
  }
 
})

io.on('connection', (socket) => {

  console.log('一台客户端端连接上了服务端,socket的id是:', socket.id)

  // 监听客户端在register事件发送标识
  socket.on('register', (clientId) => {
    clients[clientId] = {
      socket: socket,
      connected: true,
    }
    console.log(`连接上服务端的客户端的id是: ${clientId}`)
  })


  // 客户端断开连接
  socket.on('disconnect', () => {
    console.log('一台客户端端断开了服务端,socket的id是:', socket.id)
    for (let clientId in clients) {
      if (clients[clientId].socket.id === socket.id) {
        clients[clientId].connected = false
        console.log(`断开服务端连接的客户端的id是 ${clientId}`)
        break
      }
    }
  })

  // 监听客户端重新连接
  socket.on('reconnect', () => {
    console.log('一台客户端端重新连接了服务端,socket的id是:', socket.id)
    for (let clientId in clients) {
      if (clients[clientId].socket.id === socket.id) {
        clients[clientId].connected = true
        console.log(`重连到服务端的客户端的id是 ${clientId}`)
        break
      }
    }
  })

})

server.listen(port, () => {
  console.log(`项目启动成功-http://localhost:${port}`)
})
