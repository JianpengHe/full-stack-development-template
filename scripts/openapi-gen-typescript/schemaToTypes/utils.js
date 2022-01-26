"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsUnionOf = exports.tsPartial = exports.tsIntersectionOf = exports.tsTupleOf = exports.tsArrayOf = exports.transformRef = exports.nodeType = exports.comment = void 0;
const camelcase = require("camelcase");
function comment(text) {
    return `/**
  * ${text.trim().replace("\n+$", "").replace(/\n/g, "\n  * ")}
  */
`;
}
exports.comment = comment;
function nodeType(obj) {
    if (!obj || typeof obj !== "object") {
        return undefined;
    }
    if (obj["$ref"]) {
        return "ref";
    }
    // enum
    if (Array.isArray(obj.enum)) {
        return "enum";
    }
    // boolean
    if (obj.type === "boolean") {
        return "boolean";
    }
    // string
    if (["binary", "byte", "date", "dateTime", "password", "string"].includes(obj.type)) {
        return "string";
    }
    // number
    if (["double", "float", "integer", "number"].includes(obj.type)) {
        return "number";
    }
    // anyOf
    if (Array.isArray(obj.anyOf)) {
        return "anyOf";
    }
    // oneOf
    if (Array.isArray(obj.oneOf)) {
        return "oneOf";
    }
    // array
    if (obj.type === "array" || obj.items) {
        return "array";
    }
    // return object by default
    return "object";
}
exports.nodeType = nodeType;
/** Convert $ref to TS ref */
function transformRef(ref, root = "", pascalCase = true) {
    const parts = ref.replace(/^#\//, root).split("/");
    return [
        parts[0],
        ...parts.slice(1, parts.length - 1),
        camelcase(parts[parts.length - 1], { pascalCase: pascalCase }),
    ].join('.');
}
exports.transformRef = transformRef;
/** Convert T into T[]; */
function tsArrayOf(type) {
    return `(${type})[]`;
}
exports.tsArrayOf = tsArrayOf;
/** Convert array of types into [T, A, B, ...] */
function tsTupleOf(types) {
    return `[${types.join(", ")}]`;
}
exports.tsTupleOf = tsTupleOf;
/** Convert T, U into T & U; */
function tsIntersectionOf(types) {
    return `(${types.join(") & (")})`;
}
exports.tsIntersectionOf = tsIntersectionOf;
/** Convert T into Partial<T> */
function tsPartial(type) {
    return `Partial<${type}>`;
}
exports.tsPartial = tsPartial;
/** Convert [X, Y, Z] into X | Y | Z */
function tsUnionOf(types) {
    return `(${types.join(") | (")})`;
}
exports.tsUnionOf = tsUnionOf;
