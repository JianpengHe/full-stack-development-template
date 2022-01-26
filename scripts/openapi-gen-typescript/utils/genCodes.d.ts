/**
 * 遍历paths的结构，生成code数组
 */
import { OpenAPIV3 } from 'openapi-types';
import { IFileCode, IGenParmas } from './type';
interface IProps {
    openApiData: OpenAPIV3.Document;
    options: IGenParmas;
}
export declare const genCodes: (props: IProps) => Promise<{
    fileCodeList: IFileCode[];
    pathsCode: string[];
}>;
export {};
