/*
 * @Author: BINGWU
 * @Date: 2024-06-24 15:00:31
 * @LastEditors: hujiacheng hujiacheng@iipcloud.com
 * @LastEditTime: 2024-06-27 10:50:11
 * @FilePath: \print-serve\index.js
 * @Describe: 
 * @Mark: ૮(˶ᵔ ᵕ ᵔ˶)ა
 */
const express = require('express') //引用框架
const app = express() //创建服务
const port = 8088 //项目启动端口

//设置跨域访问
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", '*')
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  // 可以带cookies
  res.header("Access-Control-Allow-Credentials", true)
  if (req.method == 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})
let printData = null
let lastPrintData = null
// 接收用户参数的接口
app.get("/getParams", express.json(), (req, res) => {
  printData = req.query // 存储用户参数
  res.send({ message: "参数已接收" })
})


app.get("/sse", (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream', //设定数据类型
    'Cache-Control': 'no-cache',// 长链接拒绝缓存
    'Connection': 'keep-alive' //设置长链接
  })
  
  //持续返回数据
  setInterval(() => {

    console.log("正在持续返回数据中ing")
    lastPrintData = printData ? { ...printData } : null
    
    const data = {
      printData: lastPrintData,
      message: `Current time is ${new Date().toLocaleTimeString()}`
    }
    
    res.write(`data: ${JSON.stringify(data)}\n\n`)
    console.log('printData', JSON.stringify(data))
    printData = null
  }, 1000)
})

//创建项目
app.listen(port, () => {
  console.log(`项目启动成功-http://localhost:${port}`)
})
