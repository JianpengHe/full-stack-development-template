import axios, { Method } from 'axios'
import { message } from 'antd'
export default function fetch(options: {
  url: string
  header: string
  query?: any
  body?: any
  headers?: any
  cookie?: any
  method?: Method
}): Promise<any> {
  let data: string | undefined
  if (options.header) {
    options.headers = { 'Content-Type': options.header, ...(options.headers || {}) }
    if (options.body) {
      if (options.header.indexOf('x-www-form-urlencoded') >= 0) {
        data = (params => {
          Object.entries(options.body).forEach(param => params.append.apply(params, param))
          return String(params)
        })(new URLSearchParams())
      } else {
        data = JSON.stringify(options.body)
      }
    }
  }
  return new Promise(r => {
    axios({
      params: options.query,
      data,
      ...options,
      validateStatus: status => true,
    })
      .then(({ status, data: resData }) => {
        if (status < 300) {
          r(resData)
        } else {
          message.error(resData)
          r(undefined)
        }
      })
      .catch(e => {})
  })
}
