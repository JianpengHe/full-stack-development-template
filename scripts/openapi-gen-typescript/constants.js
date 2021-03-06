"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETemplateCode = exports.NotModifyCode = exports.SortList = exports.AllMethods = void 0;
exports.AllMethods = ['get', 'post', 'options', 'put', 'delete', 'patch', 'head'];
exports.SortList = [
    'requestUrl',
    'requestPathCode',
    'requestQueryCode',
    'requestHeaderCode',
    'requestCookieCode',
    'requestBodyCode',
    'responsesCode',
    'requestFuncTypeCode',
];
exports.NotModifyCode = `/* tslint:disable */
/**
* This file was automatically generated by openapi-gen-typescript.
* DO NOT MODIFY IT BY HAND.
*/\n`;
var ETemplateCode;
(function (ETemplateCode) {
    ETemplateCode["RequestUrl"] = "requestUrl";
    ETemplateCode["requestPathCode"] = "requestPathCode";
    ETemplateCode["RequestQueryCode"] = "requestQueryCode";
    ETemplateCode["RequestHeaderCode"] = "requestHeaderCode";
    ETemplateCode["RequestCookieCode"] = "requestCookieCode";
    ETemplateCode["RequestBodyCode"] = "requestBodyCode";
    ETemplateCode["ResponsesCode"] = "responsesCode";
    ETemplateCode["RequestFuncTypeCode"] = "requestFuncTypeCode";
})(ETemplateCode = exports.ETemplateCode || (exports.ETemplateCode = {}));
