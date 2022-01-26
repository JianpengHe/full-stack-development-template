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
exports.genDirWithTags = exports.genDirWithPaths = exports.gen = void 0;
const genCodes_1 = require("./utils/genCodes");
const fileStream_1 = require("./utils/fileStream");
const getFilePath_1 = require("./utils/getFilePath");
const getInterfaceInfo_1 = require("./utils/getInterfaceInfo");
function gen(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fetchModuleFile = `${__dirname}/defaultFetch.ts`, outputDir, pascalCase = true, } = options;
        const openApiData = yield getInterfaceInfo_1.getOpenApiDoc(options);
        const { fileCodeList, pathsCode } = yield genCodes_1.genCodes({ openApiData, options });
        const { schemasClassCode, schemasTypesCode } = getInterfaceInfo_1.handleSchema({ pascalCase, openApiData });
        yield fileStream_1.deleteFolderRecursive(outputDir);
        yield fileStream_1.writeFileFromIFileCode({
            outputDir,
            fileCodeList,
            fetchModuleFile,
            schemasClassCode,
            schemasTypesCode,
            pathsCode,
        });
        console.info(`Generate code successful in directory: ${outputDir}`);
    });
}
exports.gen = gen;
exports.genDirWithPaths = getFilePath_1.genPaths;
exports.genDirWithTags = getFilePath_1.genTags;
