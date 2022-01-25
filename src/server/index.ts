import ws, { messageType } from './utils/ws'
import Web from './utils/web'
import * as fs from 'fs'
const web = new Web()
web.route({
  async GetWebsocket(_, cb) {
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
  async GetTestHelloWorldById({ query }, cb) {
    return { id: query.id }
    /** 若没有值需要返回，可以返回空对象 */
    return {}

    /** 返回错误信息 */
    throw 'some error'

    /** 设置cookie，测试链接http://127.0.0.1/api/test/hello-world-by-id?a=5&ff=ty */
    for (const [key, value] of cb.searchParams) {
      cb.cookie[key] = value
    }
    cb.cookie.test = {
      value: '666',
      expires: new Date('2022/6/1'),
    }
    /** 若指定状态码为3xx 则location到return的值 */
    cb.res.statusCode = 302
    return 'https://www.baidu.com'
  },
  async PostTestPostFromData({ body }, cb) {
    return body
  },
  async GetCurlXxt(_, cb) {
    /** body允许直接传入一个对象，将格式化成表单post到对方服务器 */
    return {
      data: await cb.ajax('http://passport2.chaoxing.com/login', {
        uname: 'MTEx',
        password: 'MTEx',
        numcode: 1111,
      }),
    }
  },

  async GetCurlMaoYan(_, cb) {
    return (
      (
        await cb.ajax(
          'https://piaofang.maoyan.com/dashboard-ajax?orderType&uuid&User-Agent&index&channelId&sVersion&signKey'
        )
      )?.movieList?.data?.list ?? []
    ).map(({ sumSplitBoxDesc, movieInfo: { movieName, releaseInfo } }) => ({ movieName, sumSplitBoxDesc, releaseInfo }))
  },

  async GetCurlImg(_, cb, req, res) {
    res.setHeader('content-type', 'image/jpeg')
    cb.ajax('https://static.nfuca.com/plmm.jpg', undefined, { writeStream: res })

    /** 若return undefined，则不做任何处理，需要我们自行res.end */
    return undefined

    /** body允许为可读流，则向对方服务器上传数据 */
    cb.ajax('http://127.0.0.1', fs.createReadStream('index.js'))

    /** 也可以指定一个可写流，当数据接收完毕promise将被解决，返回数据大小 */
    cb.ajax('https://static.nfuca.com/plmm.jpg', undefined, { writeStream: fs.createWriteStream('plmm.jpg') })
  },
})
