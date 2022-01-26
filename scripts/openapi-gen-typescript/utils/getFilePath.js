"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPaths = exports.genTags = exports.getFilePath = void 0;
const camelcase = require("camelcase");
const format_1 = require("./format");
// 生成文件路径
const getFilePath = (props) => {
    const { handleGenPath, propForGen } = props;
    const { method, operationObject, path } = propForGen;
    let result = {};
    if (handleGenPath) {
        result = handleGenPath(propForGen);
        return result;
    }
    return exports.genTags({ method, operationObject, path });
};
exports.getFilePath = getFilePath;
// 以tags方式生成路径
const genTags = (props) => {
    const { operationObject, method, path } = props;
    const { operationId, tags } = operationObject;
    const dirName = (tags === null || tags === void 0 ? void 0 : tags[0]) || 'common';
    let fileName = operationId ||
        `${method.toLowerCase()}${format_1.getCamelcase(path, {
            pascalCase: true,
        })}`;
    fileName = camelcase(fileName.replace(/[^a-zA-Z0-9_]/g, ''), {
        pascalCase: true,
    });
    return { dirName, fileName };
};
exports.genTags = genTags;
// 以path方式生成路径
const genPaths = (props) => {
    const { path, method } = props;
    const pathArr = path.split('/');
    const dirName = path[0] === '/' ? pathArr === null || pathArr === void 0 ? void 0 : pathArr[1] : pathArr[0];
    let fileName = `${method.toLowerCase()}${format_1.getCamelcase(path, {
        pascalCase: true,
    })}`;
    fileName = camelcase(fileName.replace(/[^a-zA-Z0-9_]/g, ''), {
        pascalCase: true,
    });
    return { fileName, dirName };
};
exports.genPaths = genPaths;
