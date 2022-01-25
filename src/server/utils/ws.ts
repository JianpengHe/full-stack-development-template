import * as http from 'http'
import * as crypto from 'crypto'
enum dataType {
  'unknow' = 0,
  'string' = 1,
  'buffer' = 2,
  'close' = 8,
}
export type messageType = {
  data: Buffer | string | null
  totalSize?: number
  type?: dataType
}
export default class WebSocket {
  public socket: http.IncomingMessage['socket']
  public isWebSocket: boolean = false
  public maxBufSize: number = 0
  private needRecvSize: number = 0
  private totalSize: number = 0
  private lastBuf: Buffer = Buffer.alloc(0)
  private lastFrame: Buffer = Buffer.alloc(0)
  private dataType: dataType = dataType.unknow
  public messageQueue: messageType[] = []
  public publish: any
  constructor(req: http.IncomingMessage, res: http.ServerResponse, maxBufSize: number = 10 * 1024) {
    const { socket } = req
    if (req.headers.connection === 'Upgrade' && req.headers['sec-websocket-key']) {
      socket.on('error', err => err && console.log(err))
      socket.on('data', buf => this.onData(buf))
      res.writeHead(101, {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
        'Sec-WebSocket-Accept': crypto
          .createHash('sha1')
          .update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
          .digest('base64'),
      })
      res.flushHeaders()
      this.isWebSocket = true
      this.maxBufSize = maxBufSize
    }
    this.socket = socket
  }
  private sendBuf(...bufs: Buffer[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket.destroyed) {
        reject('socket destroyed!!!')
        return
      }
      this.socket.write(Buffer.concat(bufs), (err: Error | undefined) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
  public send(buf: Buffer | string): Promise<void> {
    const head = Buffer.alloc(10)
    const len = Buffer.byteLength(buf)
    /** 第一个字节区分Buffer|string */
    head[0] = typeof buf === 'string' ? 0x81 : 0x82

    if (len < 125) {
      head[1] = len
      return this.sendBuf(head.slice(0, 2), Buffer.from(buf))
    }

    if (len < 65535) {
      head[1] = 126
      head.writeUInt16BE(len, 2)
      return this.sendBuf(head.slice(0, 4), Buffer.from(buf))
    }

    head[1] = 127
    head.writeBigUInt64BE(BigInt(len), 2)
    return this.sendBuf(head, Buffer.from(buf))
  }
  private throwErrorFn(errmsg: string): void {
    if (!this.socket.destroyed) {
      this.socket.destroy(new Error(errmsg))
    }
  }
  private onData(buf: Buffer): void {
    /** 处理上一次未读完的buf */
    if (this.lastBuf.length) {
      buf = Buffer.concat([this.lastBuf, buf])
      if (buf.length > this.maxBufSize) {
        console.log(buf.length, this.maxBufSize)
        return this.throwErrorFn('PayloadData.length too long!')
      }
      this.lastBuf = Buffer.alloc(0)
    }

    /** 获取需要读取的长度 */
    if (this.needRecvSize === 0 && buf.length >= 2) {
      this.needRecvSize = buf[1] % 128
      if (this.needRecvSize <= 0) {
        return this.throwErrorFn('PayloadData.length===0!')
      }

      if (this.needRecvSize < 126) {
        this.needRecvSize += 6
      } else if (this.needRecvSize === 126) {
        this.needRecvSize = buf.length >= 4 ? buf.readUInt16BE(2) + 8 : 0
      } else if (this.needRecvSize === 127) {
        this.needRecvSize = buf.length >= 10 ? Number(buf.readBigUInt64BE(2)) + 14 : 0
      }
      if (!this.needRecvSize) {
        return
      }
      if (this.needRecvSize > this.maxBufSize) {
        console.log(this.needRecvSize, this.maxBufSize)
        return this.throwErrorFn('PayloadData.length too long!')
      }
    }

    /** 如果这次数据太多了，转到下次 */
    if (buf.length > this.needRecvSize) {
      this.lastBuf = buf.slice(this.needRecvSize)
      buf = buf.slice(0, this.needRecvSize)
    }

    /**  */
    if (buf.length === this.needRecvSize) {
      const isEnd = buf[0] >= 0x80
      let p = 2
      let size = 0
      if (this.dataType === dataType.unknow) {
        this.dataType = buf[0] % 16
      }

      size = buf[1] % 128
      if (size === 126) {
        size = buf.readUInt16BE(2)
        p += 2
      } else if (size === 127) {
        size = Number(buf.readBigUInt64BE(2))
        p += 8
      }
      const mask = buf.slice(p, (p += 4))
      buf = buf.slice(p)
      buf.forEach((byte, i) => {
        // tslint:disable-next-line: no-bitwise
        buf[i] ^= mask[i % 4]
      })
      if (this.lastFrame.length) {
        buf = Buffer.concat([this.lastFrame, buf])
        this.lastFrame = Buffer.alloc(0)
      }
      if (buf.length > this.maxBufSize) {
        console.log(buf.length, this.maxBufSize)
        return this.throwErrorFn('PayloadData.length too long!')
      }

      this.totalSize += size
      if (isEnd) {
        if (this.dataType === dataType.close) {
          if (!this.socket.destroyed) {
            this.socket.end()
          }
          this.messageQueue.push({
            data: null,
            totalSize: this.totalSize,
            type: this.dataType,
          })
        } else {
          this.messageQueue.push({
            data: this.dataType === dataType.string ? String(buf) : buf,
            totalSize: this.totalSize,
            type: this.dataType,
          })
        }

        if (this.publish) {
          this.publish(this.messageQueue.splice(0, 1)[0].data)
        }
        this.totalSize = 0
        this.needRecvSize = 0
        this.dataType = dataType.unknow
        return
      }
      this.needRecvSize = 0
      this.lastFrame = buf
      return
    }
    this.lastBuf = buf
  }
  public recv(): Promise<messageType['data']> {
    return new Promise(resolve => {
      if (this.messageQueue.length) {
        resolve(this.messageQueue.splice(0, 1)[0].data)
        return
      }
      this.publish = function (data: messageType['data']) {
        this.publish = null
        resolve(data)
      }
    })
  }
}
