/*
 * @Author: BINGWU
 * @Date: 2024-06-27 14:27:10
 * @LastEditors: hujiacheng hujiacheng@iipcloud.com
 * @LastEditTime: 2024-07-01 17:31:33
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
 * key: 客户端id
 * value: {
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
      connected: client.connected
    })
  }
  res.json({
    data
  })
})

app.get("/startPrint", express.json(), (req, res) => {
  const { clientId, name } = req.query // 存储用户参数
  const targetClient = clients[clientId]
  // 如果客户端存在
  if (targetClient) {
    // 且客户端在线
    if (targetClient.connected) {
      // 收到客户端的消息后再返回给客户端
      targetClient.socket.emit('print', {name})
      res.send({ message: "参数已接收" })
    } else {
      res.send({ message: "打印机离线" })
    }
  } else {
    res.send({ message: "打印机不存在" })
  }
 
})

io.on('connection', (socket) => {

  console.log('A user connected:', socket.id)

  // 监听客户端在register事件发送标识
  socket.on('register', (clientId) => {
    clients[clientId] = {
      socket: socket,
      connected: true
    }
    console.log(`Client registered: ${clientId}`)
  })


  // 接收客户端发送的消息message
  socket.on('message', ({ msg, clientId }) => {
    console.log('message: ' + msg)
    console.log('clientId: ' + clientId)
    const targetClient = clients[clientId]
    if (targetClient) {
      if (targetClient.connected) {
        // 收到客户端的消息后再返回给对应的客户端
        targetClient.socket.emit('message', msg)
      }
    }
  })

  // 客户端断开连接
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
    for (let clientId in clients) {
      if (clients[clientId].socket.id === socket.id) {
        clients[clientId].connected = false
        console.log(`Client ${clientId} disconnected`)
        break
      }
    }
  })

  // 监听客户端重新连接
  socket.on('reconnect', () => {
    for (let clientId in clients) {
      if (clients[clientId].socket.id === socket.id) {
        clients[clientId].connected = true
        console.log(`Client ${clientId} reconnected`)
        break
      }
    }
  })

})

server.listen(port, () => {
  console.log(`项目启动成功-http://localhost:${port}`)
})
