import { Method } from "axios";
export default function fetch(options: {
    url: string;
    query: any;
    body?: any;
    headers?: any;
    cookie?: any;
    method?: Method;
}): Promise<{
    body: any;
}>;
