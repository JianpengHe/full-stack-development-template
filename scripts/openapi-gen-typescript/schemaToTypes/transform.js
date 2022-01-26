"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const utils_1 = require("./utils");
// type converter
function transform(node, rootPath = "") {
    const nodeAsSchema = node;
    switch (utils_1.nodeType(node)) {
        case "ref": {
            return utils_1.transformRef(node.$ref, rootPath);
        }
        case "string":
        case "number":
        case "boolean": {
            return utils_1.nodeType(node) || "any";
        }
        case "enum": {
            return utils_1.tsUnionOf(nodeAsSchema.enum.map((item) => typeof item === "number" || typeof item === "boolean"
                ? item
                : `'${item}'`));
        }
        case "oneOf": {
            return utils_1.tsUnionOf(nodeAsSchema.oneOf.map(item => transform(item)));
        }
        case "anyOf": {
            return utils_1.tsIntersectionOf(nodeAsSchema.anyOf.map((anyOf) => utils_1.tsPartial(transform(anyOf))));
        }
        case "object": {
            // if empty object, then return generic map type
            if ((!nodeAsSchema.properties || !Object.keys(nodeAsSchema.properties).length) &&
                !nodeAsSchema.allOf &&
                !nodeAsSchema.additionalProperties) {
                return `{ [key: string]: any }`;
            }
            let properties = createKeys(nodeAsSchema.properties || {}, nodeAsSchema.required);
            // if additional properties, add to end of properties
            if (nodeAsSchema.additionalProperties) {
                properties += `[key: string]: ${nodeAsSchema.additionalProperties === true
                    ? "any"
                    : transform(nodeAsSchema.additionalProperties) || "any"};\n`;
            }
            return utils_1.tsIntersectionOf([
                ...(nodeAsSchema.allOf ? nodeAsSchema.allOf.map(item => transform(item)) : []),
                ...(properties ? [`{ ${properties} }`] : []), // then properties + additionalProperties
            ]);
        }
        case "array": {
            if (Array.isArray(nodeAsSchema.items)) {
                return utils_1.tsTupleOf(nodeAsSchema.items.map(item => transform(item)));
            }
            else {
                return utils_1.tsArrayOf(nodeAsSchema.items ? transform(nodeAsSchema.items) : "any");
            }
        }
    }
    return "";
}
exports.transform = transform;
function createKeys(obj, required) {
    let output = "";
    Object.entries(obj).forEach(([key, value]) => {
        // 1. JSDoc comment (goes above property)
        if (typeof value.description === "string") {
            output += utils_1.comment(value.description);
        }
        // 2. name (with “?” if optional property)
        output += `"${key}"${!required || !required.includes(key) ? "?" : ""}: `;
        // 3. open nullable
        if (value.nullable) {
            output += "(";
        }
        // 4. transform
        output += transform(value.schema ? value.schema : value);
        // 5. close nullable
        if (value.nullable) {
            output += ") | null";
        }
        // 6. close type
        output += ";\n";
    });
    return output;
}
