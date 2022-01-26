import { OpenAPIV3 } from 'openapi-types';
import { IGetReqBody, IGetReqParams, IParameterMap, ContentObject, IGenParmas, IHandleSchema } from './type';
export declare function getCodeFromParameters(parameters: IParameterMap | undefined, name: string, exportKey?: boolean): Promise<string>;
export declare function genContentFromComponents(openApiData: OpenAPIV3.Document, ref: string, typename: string, arr: string[]): Promise<string>;
export declare function genCodeFromContent(content: ContentObject, typeNamePrefix: string, comment?: string, responseTypeNames?: string[]): Promise<string>;
export declare const getReqParams: (props: IGetReqParams) => Promise<{
    requestPathCode: string;
    requestQueryCode: string;
    requestCookieCode: string;
    requestHeaderCode: string;
    requestPath: IParameterMap;
}>;
export declare const getReqBody: (props: IGetReqBody) => Promise<{
    requestBodyCode: string;
    requestBodyTypeNames: string[];
}>;
export declare const getOpenApiDoc: (options: IGenParmas) => Promise<OpenAPIV3.Document<{}>>;
export declare const handleSchema: (props: IHandleSchema) => {
    schemasTypesCode: string[];
    schemasClassCode: string[];
};
