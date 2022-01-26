/**
 * 根据单个接口的信息，生成需要导出的代码
 */
import { OpenAPIV3 } from 'openapi-types';
import { IGenParmas } from './type';
import OperationObject = OpenAPIV3.OperationObject;
interface IProps {
    objectElement: OperationObject;
    method: string;
    urlPath: string;
    openApiData: OpenAPIV3.Document;
    options: IGenParmas;
    pathsTypesCode: string[];
}
export declare const genCodeForInterface: (props: IProps) => Promise<string>;
export {};
