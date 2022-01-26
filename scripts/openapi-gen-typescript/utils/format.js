"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathSplicing = exports.getCamelcase = exports.toHump = exports.getFileMap = exports.getBaseUrl = exports.formatCode = void 0;
const camelcase = require("camelcase");
const prettier_1 = require("prettier");
const DEFAULT_OPTIONS = {
    printWidth: 80,
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: 'none',
    useTabs: false,
};
// 格式化代码
function formatCode(code, options = DEFAULT_OPTIONS) {
    return prettier_1.format(code, Object.assign({ parser: 'typescript' }, options));
}
exports.formatCode = formatCode;
const getBaseUrl = (openApiData) => {
    var _a, _b, _c;
    let baseUrl = '';
    if ((_b = (_a = openApiData.servers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url) {
        baseUrl = (_c = openApiData.servers[0]) === null || _c === void 0 ? void 0 : _c.url;
    }
    return baseUrl;
};
exports.getBaseUrl = getBaseUrl;
// 将含有代码和路径的对象数组转换为map
const getFileMap = (list) => {
    const map = {};
    list.forEach(el => {
        const key = el.dirName;
        if (map[key]) {
            map[key].push(el);
        }
        else {
            map[key] = [el];
        }
    });
    return map;
};
exports.getFileMap = getFileMap;
const toHump = (name) => {
    return name.replace(/\-(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
};
exports.toHump = toHump;
function getCamelcase(urlPath, options) {
    return camelcase(urlPath.split('/').join('_'), options);
}
exports.getCamelcase = getCamelcase;
const pathSplicing = (baseUrl, urlPath) => {
    let result = '';
    if (baseUrl[baseUrl.length - 1] === '/' && urlPath[0] === '/') {
        result = `${baseUrl.slice(0, -1)}${urlPath}`;
    }
    else {
        result = `${baseUrl}${urlPath}`;
    }
    return result;
};
exports.pathSplicing = pathSplicing;
