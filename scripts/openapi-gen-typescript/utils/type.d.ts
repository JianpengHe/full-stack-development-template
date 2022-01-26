import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import { ETemplateCode } from '../constants';
import MediaTypeObject = OpenAPIV3.MediaTypeObject;
import ParameterBaseObject = OpenAPIV3.ParameterBaseObject;
import OperationObject = OpenAPIV3.OperationObject;
export declare type methods = 'tags' | 'post' | 'options' | 'put' | 'delete' | 'patch' | 'head' | 'get';
export declare type ContentObject = {
    [media: string]: MediaTypeObject;
};
export interface IParameterMap {
    [name: string]: ParameterBaseObject;
}
export declare type PostScriptReturnType = {
    [key in ETemplateCode]: string;
} | {
    [key: string]: string;
};
export interface IPathMapContent {
    summary: string | undefined;
    tags: string[];
    code: string;
    path: string;
}
export declare type IHandelGenPathResult = {
    dirName?: string;
    fileName?: string;
};
export interface IHandleGenPathProps {
    info: OpenAPIV3.InfoObject;
    operationObject: OpenAPIV3.OperationObject;
    method: methods;
    path: string;
}
export interface IGenParmas {
    url?: string;
    path?: string;
    version?: string;
    object?: OpenAPI.Document;
    outputDir: string;
    fetchModuleFile?: string;
    pascalCase?: boolean;
    handlePostScript?: (obj: OperationObject, method?: string) => PostScriptReturnType;
    handleGenPath?: (props: IHandleGenPathProps) => IHandelGenPathResult;
}
export interface IFileCode {
    code: string;
    dirName?: string;
    fileName?: string;
    summary?: string;
}
export declare type IFileMap = {
    [key: string]: IFileCode[];
};
export interface IGetReqParams {
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
}
export interface IGetReqBody {
    requestBody: any;
    openApiData: OpenAPIV3.Document<{}>;
}
export interface IHandleSchema {
    pascalCase: boolean;
    openApiData: OpenAPIV3.Document;
}
export interface IGetFilePathProps {
    handleGenPath?: (props: IHandleGenPathProps) => IHandelGenPathResult;
    propForGen: IHandleGenPathProps;
}
export declare type ITagsGenProp = {
    operationObject: IHandleGenPathProps['operationObject'];
    method: IHandleGenPathProps['method'];
    path: IHandleGenPathProps['path'];
};
export declare type IPathsGenProp = {
    path: IHandleGenPathProps['path'];
    method: IHandleGenPathProps['method'];
};
