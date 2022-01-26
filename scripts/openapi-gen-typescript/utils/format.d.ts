import { Options as IOptions } from 'camelcase';
import { OpenAPIV3 } from 'openapi-types';
import { Options } from 'prettier';
import { IFileCode, IFileMap } from './type';
export declare function formatCode(code: string, options?: Options): string;
export declare const getBaseUrl: (openApiData: OpenAPIV3.Document) => string;
export declare const getFileMap: (list: IFileCode[]) => IFileMap;
export declare const toHump: (name: string) => string;
export declare function getCamelcase(urlPath: string, options?: IOptions): string;
export declare const pathSplicing: (baseUrl: string, urlPath: string) => string;