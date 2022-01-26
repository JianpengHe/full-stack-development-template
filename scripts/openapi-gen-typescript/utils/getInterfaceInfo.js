"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSchema = exports.getOpenApiDoc = exports.getReqBody = exports.getReqParams = exports.genCodeFromContent = exports.genContentFromComponents = exports.getCodeFromParameters = void 0;
// @ts-ignore
const swagger2openapi = require("swagger2openapi");
const _ = require("lodash");
const camelcase = require("camelcase");
const format_1 = require("./format");
const transform_1 = require("../schemaToTypes/transform");
const axios_1 = require("axios");
function getCodeFromParameter(parameter, name) {
    const { description, required } = parameter;
    let code = '';
    if (description) {
        code += `/* ${description} */\n`;
    }
    code += `${name}${!!required ? '' : '?'}: string;`;
    return code;
}
function getCodeFromParameters(parameters, name, exportKey = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!parameters) {
            return '';
        }
        const bodyCode = yield Promise.all(Object.keys(parameters).map(parameterName => {
            return getCodeFromParameter(parameters[parameterName], parameterName);
        }));
        return `${exportKey ? 'export' : ''} interface ${name} {\n${bodyCode.join('\n')}\n}`;
    });
}
exports.getCodeFromParameters = getCodeFromParameters;
function genContentFromComponents(openApiData, ref, typename, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        const splitRef = ref.replace(/^[^/]+\/components\//, '').split('/');
        const result = _.get(openApiData.components, splitRef);
        const { content, description } = result;
        const requestBodyCode = yield genCodeFromContent(content, typename, description, arr);
        return requestBodyCode;
    });
}
exports.genContentFromComponents = genContentFromComponents;
function genCodeFromContent(content, typeNamePrefix, comment = '', responseTypeNames = []) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!content) {
            return '';
        }
        const contentCode = yield Promise.all(Object.keys(content).map((mediaType, index) => __awaiter(this, void 0, void 0, function* () {
            const responseTypeName = `${typeNamePrefix}${index > 0 ? format_1.getCamelcase(mediaType, { pascalCase: true }) : ''}`;
            let jsonSchema = transform_1.transform(content[mediaType].schema);
            if (jsonSchema.lastIndexOf('[]') === jsonSchema.length - 2) {
                jsonSchema = jsonSchema.replace(/\(|\)|(\[\])+/g, '');
                responseTypeNames.push(`${responseTypeName}[]`);
            }
            else if (/^\(([\s\S]+)\)$/.test(jsonSchema)) {
                jsonSchema = jsonSchema.replace(/^\(([\s\S]+)\)$/, '$1');
                responseTypeNames.push(responseTypeName);
            }
            else {
                responseTypeNames.push(responseTypeName);
            }
            return `export type ${responseTypeName} = ${jsonSchema}`;
        })));
        return contentCode.join('\n');
    });
}
exports.genCodeFromContent = genCodeFromContent;
const getReqParams = (props) => __awaiter(void 0, void 0, void 0, function* () {
    // request parameter
    const { parameters } = props;
    const requestPath = {};
    const requestHeaders = {};
    const requestCookies = {};
    const requestQuery = {};
    parameters.forEach(parameter => {
        const _a = parameter, { in: keyIn, name } = _a, otherParams = __rest(_a, ["in", "name"]);
        switch (keyIn) {
            case 'path':
                requestPath[name] = otherParams;
                break;
            case 'query':
                requestQuery[name] = otherParams;
                break;
            case 'cookie':
                requestCookies[name] = otherParams;
                break;
            case 'header':
                if (['CONTENT-TYPE', 'COOKIE'].indexOf(name.toUpperCase()) === -1) {
                    requestHeaders[name] = otherParams;
                }
                break;
        }
    });
    const requestPathCode = yield getCodeFromParameters(requestPath, 'Path', true);
    const requestQueryCode = yield getCodeFromParameters(requestQuery, 'Query', true);
    const requestCookieCode = yield getCodeFromParameters(requestCookies, 'Cookie', true);
    const requestHeaderCode = yield getCodeFromParameters(requestHeaders, 'RequestHeader', true);
    return {
        requestPathCode,
        requestQueryCode,
        requestCookieCode,
        requestHeaderCode,
        requestPath,
    };
});
exports.getReqParams = getReqParams;
const getReqBody = (props) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestBody, openApiData } = props;
    const { $ref: requestRef, content, description: requestBodyDescription, } = requestBody;
    let requestBodyCode = '';
    const requestBodyTypeNames = [];
    if (requestRef) {
        requestBodyCode = yield genContentFromComponents(openApiData, requestRef, `Body`, requestBodyTypeNames);
    }
    else {
        requestBodyCode = yield genCodeFromContent(content, `Body`, requestBodyDescription, requestBodyTypeNames);
    }
    return { requestBodyCode, requestBodyTypeNames };
});
exports.getReqBody = getReqBody;
// 生成openapi的Doc对象
const getOpenApiDoc = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, path: filePath, object } = options;
    let openApiData;
    if (url || filePath || object) {
        // convertUrl响应速度很慢，改为使用convertObj
        const { convertObj, convertFile } = swagger2openapi;
        let params;
        let openapi;
        if (url) {
            try {
                const result = yield axios_1.default.get(url); // 获取object对象
                if (result.status !== 200) {
                    throw Error(`未返回正确的status code ${result.status}: ${url}`);
                }
                params = result.data;
            }
            catch (e) {
                console.error('e :>> ', e);
            }
            openapi = yield convertObj(params, {
                patch: true,
            });
        }
        if (filePath) {
            params = filePath;
            openapi = yield convertFile(params, {
                patch: true,
            });
        }
        if (object) {
            params = object;
            openapi = yield convertObj(params, {
                patch: true,
            });
        }
        openApiData = openapi.openapi;
    }
    else {
        throw 'option: url or filePath or object must be specified one';
    }
    return openApiData;
});
exports.getOpenApiDoc = getOpenApiDoc;
const handleSchema = (props) => {
    const { openApiData, pascalCase } = props;
    const { schemas } = openApiData.components || {};
    const schemasTypesCode = [];
    const schemasClassCode = [];
    if (schemas) {
        Object.keys(schemas).forEach(schemaKey => {
            const schemaObject = schemas[schemaKey];
            if (pascalCase) {
                schemaKey = camelcase(schemaKey, { pascalCase: true });
            }
            const transformObject = transform_1.transform(schemaObject);
            schemasTypesCode.push(`export type ${schemaKey} = ${transformObject}`);
            const classObject = transformObject.replace(/[()]/g, '').replace(/components.schemas./g, '');
            // 处理当组件为数组的情况
            if (classObject.endsWith('[]')) {
                const classObjectRemoveArrayMark = classObject.substr(0, classObject.length - 2);
                schemasClassCode.push(`export class ${schemaKey}Item ${classObjectRemoveArrayMark}\n`);
                schemasClassCode.push(`export type ${schemaKey} = ${schemaKey}Item[]\n`);
            }
            else {
                schemasClassCode.push(`export class ${schemaKey} ${classObject}\n`);
            }
        });
    }
    return {
        schemasTypesCode,
        schemasClassCode,
    };
};
exports.handleSchema = handleSchema;
