import ws, { messageType } from './ws'
import Web from './web'
import * as fs from 'fs'
const web = new Web()
web.route({
  async websocket(cb) {
    const websocket = new ws(cb.req, cb.res)
    let recvMsg: messageType['data']
    if (websocket.isWebSocket) {
      clearTimeout(cb.timer)
      websocket.send('hello')
      setInterval(() => {
        websocket.send('当前北京时间' + new Date().toLocaleString())
      }, 1000)
      // tslint:disable-next-line: no-conditional-assignment
      while ((recvMsg = await websocket.recv()) !== null) {
        console.log(recvMsg)
        websocket.send('收到' + recvMsg)
      }
      // console.log()
      return 'websocket close'
    }
    return 'Please use the websocket protocol.'
  },
  async test(cb) {
    return cb.query
  },
  async hello(cb) {
    return cb.cookie['trace-branch']
  },
  async post(cb) {
    return cb.form
  },
  async xxt(cb) {
    return {
      data: await cb.ajax(
        'http://passport2.chaoxing.com/login',
        {
          uname: 'MTEx',
          password: 'MTEx',
          numcode: 1111,
        }
      ),
    }
  },
  async maoyan(cb) {
    return await cb.ajax(
      'https://piaofang.maoyan.com/dashboard-ajax?orderType&uuid&User-Agent&index&channelId&sVersion&signKey'
    )
  },
  async stream(cb, req, res) {
    //  cb.ajax("http://127.0.0.1", fs.createReadStream("index.js"))
    // cb.ajax("https://static.nfuca.com/plmm.jpg",undefined,{writeStream:fs.createWriteStream("plmm.jpg")})
    res.setHeader("content-type", "image/jpeg")
    cb.ajax("https://static.nfuca.com/plmm.jpg", undefined, { writeStream: res })

    return
  }
})
