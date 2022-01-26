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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolderRecursive = exports.writeFileFromIFileCode = void 0;
// @ts-ignore
const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");
const format_1 = require("./format");
const constants_1 = require("../constants");
const writeFileFromIFileCode = (props) => __awaiter(void 0, void 0, void 0, function* () {
    const { outputDir, fileCodeList, fetchModuleFile, schemasClassCode, schemasTypesCode, pathsCode, } = props;
    yield mkdirp(outputDir);
    const fileMap = format_1.getFileMap(fileCodeList);
    yield Promise.all(Object.keys(fileMap).map((dirName) => __awaiter(void 0, void 0, void 0, function* () {
        const fileList = fileMap[dirName];
        yield mkdirp(`${outputDir}/${dirName}`);
        fileList.forEach(el => {
            const pathCode = [
                '/* tslint:disable */',
                `/**
          * @namespace ${el.fileName}
          * @summary ${el.summary}
          */\n`,
                `import fetchImpl from '${path
                    .relative(`${outputDir}/${dirName}`, fetchModuleFile)
                    .replace(/\.ts$/, '')}';`
                    .split(path.sep)
                    .join('/'),
                schemasClassCode.length > 0 ? `import * as schemas from '../schemas';\n` : '\n',
                el.code,
            ].join('\n');
            fs.writeFileSync(`${outputDir}/${dirName}/${el.fileName}.ts`, format_1.formatCode(pathCode));
        });
        const tagCode = getTagCode(dirName, fileList);
        fs.writeFileSync(`${outputDir}/${dirName}/index.ts`, format_1.formatCode(tagCode));
    })));
    const typesCode = getTypeCode({ schemasTypesCode, pathsCode });
    fs.writeFileSync(`${outputDir}/index.ts`, format_1.formatCode(typesCode));
    if (schemasTypesCode.length > 0) {
        const schemasCodeArray = schemasTypesCode.map(item => item.replace(/[()]/g, '').replace(/components.schemas./g, ''));
        const schemasCode = [constants_1.NotModifyCode, schemasCodeArray.join('\n')].join('\n');
        fs.writeFileSync(`${outputDir}/schemasTypes.ts`, format_1.formatCode(schemasCode));
    }
    if (schemasClassCode.length > 0) {
        const classCode = [constants_1.NotModifyCode, schemasClassCode.join('\n')].join('\n');
        fs.writeFileSync(`${outputDir}/schemas.ts`, format_1.formatCode(classCode));
    }
});
exports.writeFileFromIFileCode = writeFileFromIFileCode;
const getTagCode = (dirName, fileCodeList) => {
    const nameSpaceList = fileCodeList
        .map(it => it.fileName)
        .map(it => format_1.toHump(it));
    const tagCode = [
        `/**
      * @description ${dirName.split('/').pop()}
      */\n`,
        ...nameSpaceList.map(key => `import * as ${key} from './${key}';`),
        `\nexport {
        ${nameSpaceList.join(',\n')}
      }`,
    ].join('\n');
    return tagCode;
};
const getTypeCode = (props) => {
    const { schemasTypesCode, pathsCode } = props;
    const typesCode = [
        constants_1.NotModifyCode,
        `export namespace components { export namespace schemas { ${schemasTypesCode.join('\n')} } } `,
        `export namespace Api { ${pathsCode.join('\n')} } `,
    ].join('\n');
    return typesCode;
};
function deleteFolderRecursive(filePath) {
    let files = [];
    /**
     * 判断给定的路径是否存在
     */
    if (fs.existsSync(filePath)) {
        /**
         * 返回文件和子目录的数组
         */
        files = fs.readdirSync(filePath);
        files.forEach(function (file, index) {
            const curPath = path.join(filePath, file);
            /**
             * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
             */
            if (fs.statSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        /**
         * 清除文件夹
         */
        fs.rmdirSync(filePath);
    }
    else {
        // console.log('给定的路径不存在，请给出正确的路径');
    }
}
exports.deleteFolderRecursive = deleteFolderRecursive;
