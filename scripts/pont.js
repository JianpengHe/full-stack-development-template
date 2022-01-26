const { gen, genDirWithPaths } = require('./openapi-gen-typescript')
const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const Path = path.join(__dirname, '../')
const port = (Math.random() * 50000 + 10000) | 0
const info = new Map()
http
  .createServer((req, res) => {
    const url = req.url.substring(1)
    if (!info.has(url)) {
      res.end('404')
      return
    }
    res.end(info.get(url).file)
  })
  .listen(port)
fs.readFile('pont-info.json', (err, data) => {
  if (err || !data || !String(data)) {
    console.log('\x1B[31m接口定义文件pont-info.json无内容\x1B[0m: ')
    return
  }
  Object.entries(JSON.parse(String(data))).forEach(([name, url]) => info.set(name, { name, tag: [], url, file: null }))
  const deleteFolderRecursive = function (filePath) {
    if (fs.existsSync(filePath)) {
      fs.readdirSync(filePath).forEach(file => {
        const curPath = path.join(filePath, file)
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(filePath)
    }
  }
  deleteFolderRecursive(path.join(Path, 'src/frontend/typings/api'))
  deleteFolderRecursive(path.join(Path, 'src/server/typings/api'))
  fs.mkdirSync(path.join(Path, 'src/frontend/typings/api'))
  fs.mkdirSync(path.join(Path, 'src/server/typings/api'))
  console.log('获取数据')
  Promise.all(
    [...info.values()].map(
      ({ url, name }) =>
        new Promise(r => {
          try {
            ;(new URL(url).protocol === 'https:' ? https : http).get(url, res => {
              const body = []
              res.on('data', chuck => body.push(chuck))
              res.on('end', () => {
                info.get(name).file = Buffer.concat(body).toString()
                r()
              })
            })
          } catch (e) {
            fs.readFile(path.join(Path, url), (err, body) => {
              if (body && body.toString()) {
                info.get(name).file = body.toString()
              }
              r()
            })
          }
        })
    )
  ).then(get)
})

const get = () =>
  console.log('生成接口定义') ||
  Promise.all(
    [...info.values()].map(
      ({ name }) =>
        new Promise(r => {
          const outputDir = path.join(Path, `src/frontend/typings/api/${name}`)
          gen({
            url: 'http://127.0.0.1:' + port + '/' + name,
            fetchModuleFile: path.join(Path, 'src/frontend/utils/request.ts'),
            outputDir,
            handleGenPath: genDirWithPaths,
          })
            .then(() => {
              fs.readdir(outputDir, { withFileTypes: true }, (err, data) => {
                if (err || !data) {
                  r()
                  console.log('\x1B[31m无法读取目录\x1B[0m: ', outputDir)
                  return
                }
                info.get(name).tag = data.filter(fd => fd.isDirectory()).map(({ name }) => name)
                r()
              })

              console.log('\x1B[32msucceed\x1B[0m', name)
            })
            .catch(reason => {
              r()
              console.log('\x1B[31mfailed\x1B[0m: ', name, reason.message)
            })
        })
    )
  ).then(() => build())

const build = () => {
  const indexTs = [],
    serverTypes = ["import * as http from 'http'", "import { CB } from '../../utils/web'", ''],
    route = []
  const fileNameList = []
  ;[...info.values()].forEach(({ tag, name, file }) => {
    if (!file) {
      return
    }
    fs.writeFileSync(
      path.join(Path, `src/server/typings/api/${name}.ts`),
      fs
        .readFileSync(path.join(Path, `src/frontend/typings/api/${name}/index.ts`))
        .toString()
        .replace(/export namespace [^{]+ \{/g, ch => ch.toLowerCase())
    )
    serverTypes.push(`import * as ${name} from './${name}'`, '')
    tag.forEach(m => indexTs.push(`import * as ${name}_${m} from './${name}/${m}'`))
    indexTs.push(`export const ${name}={${tag.map(m => `...${name}_${m}`).join(',')}}`, '')
    const { paths, basePath } = JSON.parse(file)
    for (const path in paths) {
      const fileName = path.replace(/[^a-zA-Z0-9][a-zA-Z0-9]/g, ch => ch.toUpperCase().replace(/[^a-zA-Z0-9]/g, ''))
      const filename = path.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
      for (const method in paths[path]) {
        const obj = paths[path][method]
        const Method = method.replace(/[a-z]/, ch => ch.toUpperCase())
        const typeName = `${name}.api.${method}${filename}`
        route.push([`${Method}${fileName}`, { path, route: `${method}${basePath || ''}${path}`, method, cb: null }])
        fileNameList.push(
          `/** ${obj.summary || obj.description} */`,
          `${Method}${fileName}: ( reqData: ${Method}${fileName}ReqData, cb: CB, req: http.IncomingMessage, res: http.ServerResponse ) => `,
          ` Promise<${typeName}.Response200${
            obj.responses['200']?.schema?.type === 'array' ? '[]' : ''
          } | string | undefined>`
        )
        serverTypes.push(
          `export type ${Method}${fileName}ReqData = {`,
          `    path: ${typeName}.Path`,
          `    query: ${typeName}.Query`,
          ['get', 'head', 'options'].includes(method) ? '' : `    body: ${typeName}.Body`,
          `    headers: ${typeName}.RequestHeader`,
          `    cookie: ${typeName}.Cookie`,
          `}`,
          ``
        )
      }
    }
  })
  indexTs.push(`export default ${JSON.stringify([...info.keys()])}`, '')
  fs.writeFileSync(path.join(Path, `src/frontend/typings/api/index.ts`), indexTs.join('\n'))
  serverTypes.push(`interface IServerTypes {`, ...fileNameList, `  }`, `export default IServerTypes`, '')
  fs.writeFileSync(path.join(Path, `src/server/typings/api/index.ts`), serverTypes.join('\n'))
  fs.writeFileSync(
    path.join(Path, `src/server/typings/api/route.ts`),
    `const routeMap=new Map(${JSON.stringify(route)})\nexport default routeMap`
  )
  process.exit()
}
