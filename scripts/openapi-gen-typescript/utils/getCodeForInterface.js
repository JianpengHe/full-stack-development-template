'use strict'
/**
 * 根据单个接口的信息，生成需要导出的代码
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.genCodeForInterface = void 0
const camelcase = require('camelcase')
const _ = require('lodash')
const constants_1 = require('../constants')
const format_1 = require('./format')
const getInterfaceInfo_1 = require('./getInterfaceInfo')
// 生成单个接口的代码
const genCodeForInterface = props =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { objectElement, method, urlPath, openApiData, options, pathsTypesCode } = props
    const { operationId, parameters = [], requestBody = {}, responses } = objectElement
    let result = ''
    let namespaceName =
      operationId ||
      `${method.toLowerCase()}${format_1.getCamelcase(urlPath, {
        pascalCase: true,
      })}`
    namespaceName = camelcase(namespaceName.replace(/[^a-zA-Z0-9_]/g, ''), {
      pascalCase: true,
    })
    // request parameter
    const { requestCookieCode, requestHeaderCode, requestPathCode, requestQueryCode, requestPath } =
      yield getInterfaceInfo_1.getReqParams({ parameters })
    const { $ref: requestRef, required: requestBodyRequired } = requestBody
    // request body
    const { requestBodyCode, requestBodyTypeNames } = yield getInterfaceInfo_1.getReqBody({ requestBody, openApiData })
    // response
    const responseTypeNames = []
    const responsesArr = Object.keys(responses)
    const responsesCode = (yield Promise.all(
      responsesArr.map(statusCode =>
        __awaiter(void 0, void 0, void 0, function* () {
          const responsesObjectElement = responses[statusCode]
          const { $ref, content, description } = responsesObjectElement
          const typeNamePrefix = `Response${camelcase(statusCode, {
            pascalCase: true,
          })}`
          if ($ref) {
            const responseCode = yield getInterfaceInfo_1.genContentFromComponents(
              openApiData,
              requestRef,
              typeNamePrefix,
              requestBodyTypeNames
            )
            return responseCode
          } else {
            // response
            const responseCode = yield getInterfaceInfo_1.genCodeFromContent(
              content,
              typeNamePrefix,
              description,
              responseTypeNames
            )
            return responseCode
          }
        })
      )
    )).join('\n')
    const requestFuncTypeCode = `
              export const request = async (options: {
                path?: Path;
                query?: Query;
                body${requestBodyRequired ? '' : '?'}: ${
      requestBodyTypeNames.length > 0 ? requestBodyTypeNames.join('|') : 'any'
    };
                headers?: RequestHeader;
                cookie?: Cookie;
              }, otherOptions?: any): Promise< ${
                responseTypeNames.length > 0 ? responseTypeNames.join('|') : 'any'
              } > =>  {
                let resolvedUrl = '${format_1.pathSplicing(format_1.getBaseUrl(openApiData), urlPath)}';
                ${
                  _.isEmpty(requestPath)
                    ? ''
                    : `if (!!options.path) {
                  Object.keys(options.path).map(key => {
                    const regex = new RegExp(\`({(\${key})})|(:(\${key}))\`, 'g');
                    resolvedUrl = url.replace(regex, options.path[key]);
                  });
                }`
                }
                return fetchImpl({
                  url: resolvedUrl,
                  header: '${Object.keys(requestBody.content ?? {})[0] || ''}', 
                  method: '${method.toLowerCase()}',
                  ...options, 
                  ...otherOptions 
                });
              };
            `
    const requestUrl = `export const url = \`${format_1.pathSplicing(format_1.getBaseUrl(openApiData), urlPath)}\``
    let exportObj = {
      requestUrl,
      requestPathCode,
      requestQueryCode,
      requestHeaderCode,
      requestCookieCode,
      requestBodyCode,
      responsesCode,
      requestFuncTypeCode,
    }
    if (options.handlePostScript) {
      const result = yield options.handlePostScript(objectElement, method)
      exportObj = Object.assign({}, exportObj, result)
    }
    const exportArr = []
    constants_1.SortList.forEach(item => {
      exportArr.push(exportObj[item])
    })
    Object.keys(exportObj).forEach(item => {
      if (!constants_1.SortList.includes(item)) {
        exportArr.unshift(exportObj[item])
      }
    })
    const pathsTypesArr = exportArr.map(exp => {
      return exp
        .replace(/export const request = async/, 'export type request =')
        .replace(/: Promise<([^>]+)>((\s|\S)+)/g, '=> Promise<$1>;')
    })
    pathsTypesCode.push(`export namespace ${namespaceName} {\n${pathsTypesArr.join('\n')}\n}`)
    const generateClassArr = exportArr.map(exp => {
      const exp1 = exp.replace(/ interface | type = /g, ' class ')
      const exp2 = exp1.replace(/ type ([^=]+) = components.([a-zA-Z0-9._]+)[;{}]?/g, ' class $1 extends $2 {}')
      const exp3 = exp2.replace(/ type ([^=]+) = {/g, ' class $1 {')
      const exp4 = exp3.replace(/components.schemas/g, 'schemas')
      return exp4
    })
    result = generateClassArr.join('\n')
    return result
  })
exports.genCodeForInterface = genCodeForInterface
