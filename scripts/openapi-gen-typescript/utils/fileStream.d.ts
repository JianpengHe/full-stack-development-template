import { IFileCode } from './type';
interface IProps {
    outputDir: string;
    fileCodeList: IFileCode[];
    fetchModuleFile: string;
    schemasClassCode: string[];
    schemasTypesCode: string[];
    pathsCode: string[];
}
export declare const writeFileFromIFileCode: (props: IProps) => Promise<void>;
export declare function deleteFolderRecursive(filePath: string): void;
export {};
