/*
 * @Author: BINGWU
 * @Date: 2024-06-27 11:27:11
 * @LastEditors: hujiacheng hujiacheng@iipcloud.com
 * @LastEditTime: 2024-06-27 14:03:57
 * @FilePath: \print-serve\websocket.js
 * @Describe: 
 * @Mark: ૮(˶ᵔ ᵕ ᵔ˶)ა
 */
const express = require('express') //引用框架
const app = express() //创建服务
const WebSocket = require("ws")
const port = 8088 //项目启动端口
const wss = new WebSocket.Server({ port: 3200 })

console.log("WebSocket服务运行在http://localhost:3200/")
let printData = null
let wsClient = null
app.get("/getParams", express.json(), (req, res) => {
  printData = req.query // 存储用户参数
  if (wsClient) {
    wsClient.send(`收到参数：${JSON.stringify(printData)}`)
  }
  res.send({ message: "参数已接收" })
})

wss.on("connection", (ws) => {
  ws.send(`已连接到服务端的websocket`)
  wsClient = ws
  let index = 1
  const interval = setInterval(() => {
    ws.send(`[websocket]数据推送第${index}次`)
    index++
  }, 1000)
  ws.on("message", (message) => {
    console.log(`[websocket]收到消息：${message}`)
  })
  ws.on("close", () => {
    clearInterval(interval) // 清除定时器
    console.log("断开连接")
  })
})

//创建项目
app.listen(port, () => {
  console.log(`项目启动成功-http://localhost:${port}`)
})
