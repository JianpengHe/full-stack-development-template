import { IJsonSchema, OpenAPIV3 } from "openapi-types";
import ReferenceObject = OpenAPIV3.ReferenceObject;
export declare function transform(node: ReferenceObject | IJsonSchema, rootPath?: string): string;
