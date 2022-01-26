"use strict";
/**
 * 遍历paths的结构，生成code数组
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genCodes = void 0;
const constants_1 = require("../constants");
const getFilePath_1 = require("./getFilePath");
const getCodeForInterface_1 = require("./getCodeForInterface");
const format_1 = require("./format");
const genCodes = (props) => __awaiter(void 0, void 0, void 0, function* () {
    const result = {
        fileCodeList: [],
        pathsCode: [],
    };
    const { openApiData, options } = props;
    const { paths, info } = openApiData;
    const { handleGenPath } = options;
    yield Promise.all(Object.keys(paths).map((urlPath) => __awaiter(void 0, void 0, void 0, function* () {
        const pathsObject = paths[urlPath];
        const filterMethods = constants_1.AllMethods.filter(method => !!pathsObject[method]);
        const pathsTypesCode = [];
        yield Promise.all(filterMethods.map((method) => __awaiter(void 0, void 0, void 0, function* () {
            const objectElement = pathsObject[method];
            const { summary } = objectElement;
            // 生成单个接口的代码
            const code = yield getCodeForInterface_1.genCodeForInterface({
                options,
                openApiData,
                urlPath,
                method,
                objectElement,
                pathsTypesCode,
            });
            // 生成单个接口的路径
            const { dirName, fileName } = getFilePath_1.getFilePath({
                handleGenPath,
                propForGen: {
                    operationObject: objectElement,
                    info,
                    method,
                    path: urlPath,
                },
            });
            if (dirName && fileName) {
                result.fileCodeList.push({
                    code,
                    dirName: format_1.toHump(dirName),
                    fileName: format_1.toHump(fileName),
                    summary,
                });
            }
            else {
                console.log(`${urlPath}-${method}接口没有返回符合规范的路径`);
            }
        })));
        result.pathsCode.push(pathsTypesCode.join('\n'));
    })));
    return result;
});
exports.genCodes = genCodes;
