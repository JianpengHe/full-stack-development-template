import * as http from 'http'
import * as https from 'https'
import * as crypto from 'crypto'
import * as zlib from 'zlib'
import * as fs from 'fs'
import * as stream from 'stream';

// const MD5 = (str: string): string => crypto.createHash('md5').update(str).digest('hex')
export type setCookie = {
  name: string
  value: string
  domain?: string
  expires?: string | number | Date
  path?: string
  secure?: string
  httpOnly?: boolean
}
class CB extends URL {
  public query: { [x: string]: string } = {}
  public req: http.IncomingMessage
  public res: http.ServerResponse
  public timer: NodeJS.Timeout
  public form: { [x: string]: string } = {}
  public reqData: Buffer = Buffer.alloc(0)
  private cookieMap = new Map()
  public setCookie: setCookie[] = []
  constructor(req: http.IncomingMessage, res: http.ServerResponse, timeout: number = 30000) {
    super('http://' + (req.headers.host ?? '127.0.0.1') + (req.url ?? ''))
    this.req = req
    this.res = res
    this.timer = setTimeout(() => {
      if (res.writableEnded) {
        return
      }
      res.statusCode = 502
      res.end('timeout')
    }, timeout)
    this.query = [...this.searchParams.entries()].reduce(
      (obj, [key, value]) => Object.assign(obj, { [key]: value }),
      this.query
    )
    req.headers.cookie
      ?.toString()
      .replace(/\s/g, '')
      .split(';')
      .forEach((cookie: string) => {
        const index = cookie.indexOf('=')
        this.cookieMap.set(cookie.substring(0, index), cookie.substring(index + 1))
      })
  }
  public cookie = new Proxy(this, {
    get(target, key: string) {
      return target.cookieMap.get(key)
    },
    set(target, key: string, value: string | (setCookie & { name?: string })) {
      if (typeof value === 'string') {
        target.setCookie.push({ name: key, value, path: '/' })
      } else {
        if (!value.name) {
          value.name = key
        }
        target.setCookie.push(value)
      }
      // target.res.setHeader('set-cookie', `${key}=` + (typeof value === 'string' ? `${value} ;path=/` : ``))
      return true
    },
  })
  public JSONparse(str: string) {
    try {
      return JSON.parse(str)
    } catch (e) {
      return undefined
    }
  }
  // public getItem(obj: { [x: string]: any } | any[] | undefined, item:string,...items: string[]) {
  //   if(!obj){return undefined}
  //   if(items.length===0){return obj[item]}
  //   return this.getItem(obj[item],...items)
  // }
  public resEnd(str: string, statusCode?: number) {
    if (this.res.writableFinished) {
      return
    }
    if (statusCode) {
      this.res.statusCode = statusCode
    }
    if ((this.req.headers['accept-encoding'] || '').toString().toLocaleLowerCase().includes('gzip')) {
      zlib.gzip(str, (err, zlibStr) => {
        clearTimeout(this.timer)
        if (this.res.writableFinished) {
          return
        }
        if (err) {
          console.log(`服务器压缩模块出错`)
          console.log(err)
          this.res.end(str)
          return
        }
        this.res.setHeader('Content-Encoding', 'gzip')
        this.res.end(zlibStr)
      })
      return
    }
    clearTimeout(this.timer)
    this.res.end(str)
  }
  public getReqData() {
    const reqDatas: Buffer[] = []
    return new Promise(resolve => {
      this.req.on('data', chuck => reqDatas.push(chuck))
      this.req.on('end', () => {
        this.reqData = Buffer.concat(reqDatas)
        reqDatas.length = 0
        if (this.req.headers['content-type']?.includes('x-www-form-urlencoded')) {
          this.form = [...new URLSearchParams(String(this.reqData)).entries()].reduce(
            (obj, [key, value]) => Object.assign(obj, { [key]: value }),
            this.form
          )
        }
        resolve(this.reqData)
      })
    })
  }
  public ajax(
    url: string,
    body: rawObject | Buffer | stream.Duplex | stream.Readable | string = '',
    options: http.RequestOptions & { formatResult?: (body: Buffer, res: http.IncomingMessage, req: http.ClientRequest) => any | null, writeStream?: stream.Writable | stream.Duplex } = {}
  ): Promise<any> {
    if (options.formatResult === undefined) {
      options.formatResult = (res2body, res2): Buffer | string | rawObject => {
        if (res2.headers['content-type']) {
          const contentType = String(res2.headers['content-type'])

          if (contentType.includes("json")) {
            return this.JSONparse(String(res2body))
          }
          if (contentType.includes("text")) {
            return String(res2body)
          }
        } else if (/^((\{.*\})|(\[.*\]))$/.test(String(res2body).trim())) {
          return this.JSONparse(String(res2body).trim()) || res2body
        }
        return res2body
      }
    }
    options.timeout = options.timeout ?? 10000
    const that = this
    const timer = setTimeout(() => {
      that.resEnd('服务器请求超时', 504)
      console.log(url, '服务器请求超时')
    }, options.timeout)
    const errFn = err => {
      console.log(url, err)
      that.resEnd('服务器请求错误', 502)
    }
    if (!options.headers) {
      options.headers = {}
    }
    options.headers.referer = options.headers.referer ?? url
    options.headers['user-agent'] =
      options.headers['user-agent'] ??
      (this.req.headers['user-agent'] ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36')
    if (body) {
      if (typeof body === 'object' && !(body instanceof Buffer) && !(body instanceof stream)) {
        const searchParams = new URLSearchParams()
        Object.entries(body).forEach(([key, value]) => searchParams.set(key, String(value)))
        body = String(searchParams)
        if (!options.headers['content-type']) {
          options.headers['content-type'] = 'application/x-www-form-urlencoded'
        }
      }
      options.method = options.method ?? 'post'
    }
    return new Promise(resolve => {
      const req2 = (/^https/.test(url) ? https : http)
        .request(url, options, res2 => {
          if (options.writeStream) {
            res2.pipe(options.writeStream)
            res2.on("close", () => {
              clearTimeout(timer)
              resolve(res2.readableLength)
            })
          } else {
            const res2chucks: Buffer[] = []
            res2.on('error', errFn)
            res2.on('data', chuck => res2chucks.push(chuck))
            res2.on('end', () => {
              const res2body = Buffer.concat(res2chucks)
              clearTimeout(timer)
              resolve(options.formatResult ? options.formatResult(res2body, res2, req2) : res2body)
            })
          }
        });
      req2.on('error', errFn)
      if (body instanceof stream) {
        body.pipe(req2)
      } else {
        req2.end(body ? body : undefined)
      }
    })
  }
}
export type rawObject = { [x: string]: any } | any[]
export type routeCallbackRetrun = string | rawObject | null | undefined
export type routeCallbackFn = (cb: CB, req: http.IncomingMessage, res: http.ServerResponse) => Promise<routeCallbackRetrun>
export type webOpts = {
  api?: Map<string, routeCallbackFn>
  timeout?: number
  port?: number
  rootDir?: string
  apiPrefix?: string
  httpServer?: http.Server
  sessionName?: string
  sessionLife?: number
}
export default class Web {
  public api: Map<string, routeCallbackFn>
  public timeout: number
  public port: number
  public rootDir: string
  public apiPrefix: string
  public httpServer: http.Server
  public sessionName: string
  public sessionLife: number
  constructor(opts: webOpts = {}) {
    this.timeout = opts.timeout ?? 30000
    this.port = opts.port || 80
    this.rootDir = opts.rootDir ?? __dirname + '/../frontend'
    this.apiPrefix = opts.apiPrefix ?? '/api/'
    this.httpServer = opts.httpServer || http.createServer()
    if (!opts.httpServer) {
      this.httpServer.listen(this.port)
    }
    this.sessionName = opts.sessionName || '_PG-Tool'
    this.sessionLife = opts.sessionLife || 20 * 60000
    this.httpServer.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => this.request(req, res))
    this.api = opts.api ?? new Map()
  }
  public route(route: { [x: string]: routeCallbackFn }) {
    Object.entries(route).forEach(([path, cb]) => this.api.set(path, cb))
    return this
  }
  public async request(req: http.IncomingMessage, res: http.ServerResponse) {
    const cb = new CB(req, res, this.timeout)
    if (!req.complete) {
      /*req.method === 'post'*/
      await cb.getReqData()
    }
    if (cb.pathname.indexOf(this.apiPrefix) === 0) {
      /** api路由 */
      const route = cb.pathname.substring(this.apiPrefix.length)
      if (!this.api.has(route)) {
        res.writeHead(404)
        res.end('404')
        return
      }
      res.setHeader('content-type', 'application/json')
      const result = await this.api.get(route)?.call(this, cb, req, res)
      if (res.writableEnded) {
        return
      }
      switch (typeof result) {
        case 'object':
          return cb.resEnd(JSON.stringify({ code: 0, data: result ?? null, msg: 'ok' }))
        case 'string':
          if (/^3/.test(String(res.statusCode || ''))) {
            res.setHeader('location', result)
            res.end('正在跳转')
            return
          }
          return cb.resEnd(JSON.stringify({ code: -6, data: null, msg: result }), 403)
      }
    } else {
      /** 静态文件路由 */
      try {
        const ReadStream = (
          await fs.promises.open(this.rootDir + cb.pathname + (/\/$/.test(cb.pathname) ? 'index.html' : ''), 'r')
        ).createReadStream()
        if ((req.headers['accept-encoding'] || '').toString().toLocaleLowerCase().includes('gzip')) {
          res.setHeader('Content-Encoding', 'gzip')
          ReadStream.pipe(zlib.createGzip()).pipe(res)
          return
        }
        ReadStream.pipe(res)
      } catch (e) {
        res.writeHead(404)
        res.end('404')
      }
      clearTimeout(cb.timer)
    }
  }
}
