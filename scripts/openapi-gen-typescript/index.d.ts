import { IGenParmas } from './utils/type';
export declare function gen(options: IGenParmas): Promise<void>;
export declare const genDirWithPaths: (props: import("./utils/type").IPathsGenProp) => import("./utils/type").IHandelGenPathResult;
export declare const genDirWithTags: (props: import("./utils/type").ITagsGenProp) => import("./utils/type").IHandelGenPathResult;
