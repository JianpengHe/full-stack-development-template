export declare function comment(text: string): string;
/** Return type of node (works for v2 or v3, as there are no conflicting types) */
declare type SchemaObjectType = "anyOf" | "array" | "boolean" | "enum" | "number" | "object" | "oneOf" | "ref" | "string";
export declare function nodeType(obj: any): SchemaObjectType | undefined;
/** Convert $ref to TS ref */
export declare function transformRef(ref: string, root?: string, pascalCase?: boolean): string;
/** Convert T into T[]; */
export declare function tsArrayOf(type: string): string;
/** Convert array of types into [T, A, B, ...] */
export declare function tsTupleOf(types: string[]): string;
/** Convert T, U into T & U; */
export declare function tsIntersectionOf(types: string[]): string;
/** Convert T into Partial<T> */
export declare function tsPartial(type: string): string;
/** Convert [X, Y, Z] into X | Y | Z */
export declare function tsUnionOf(types: string[]): string;
export {};
