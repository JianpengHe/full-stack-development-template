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
      return 'websocket close'
    }
    return 'Please use the websocket protocol.'
  },
  async test(cb) {
    return cb.query
  },
  async hello(cb) {
    /** 若没有值需要返回，可以返回空对象或null，因为判断依据是typeof是否为object */
    return {}
  },
  async post(cb) {
    return cb.form
  },
  async xxt(cb) {
    /** body允许直接传入一个对象，将格式化成表单post到对方服务器 */
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

    /** body允许为可读流，则向对方服务器上传数据 */
    // cb.ajax("http://127.0.0.1", fs.createReadStream("index.js"))

    /** 也可以指定一个可写流，当数据接收完毕promise将被解决，返回数据大小 */
    // cb.ajax("https://static.nfuca.com/plmm.jpg",undefined,{writeStream:fs.createWriteStream("plmm.jpg")})
    res.setHeader("content-type", "image/jpeg")
    cb.ajax("https://static.nfuca.com/plmm.jpg", undefined, { writeStream: res })

    /** 若return undefined，则不做任何处理，需要我们自行res.end */
    return undefined
  },
  async baidu(cb) {
    /** 若指定状态码为3xx 则location到return的值 */
    cb.res.statusCode = 302;
    return "https://www.baidu.com"
  }
})
