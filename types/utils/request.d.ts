/**
 * This file is copied from https://github.com/react-component/upload/blob/master/src/request.js
 * Thanks the authors.
 */
export declare type UploadProgressEvent = ProgressEvent & {
    percent: number;
};
export interface RequestResult {
    status: number;
    statusText: string;
    data: any;
    headers: any;
    xhr: XMLHttpRequest;
}
export interface RequestOptions {
    onProgress?: (e: UploadProgressEvent) => void;
    onError: (error: any, body?: object) => void;
    onSuccess: (result: any, xhr: XMLHttpRequest) => void;
    data: Document | BodyInit | null;
    withCredentials?: boolean;
    headers?: object;
    method?: string;
    timeout?: number;
}
export default function request(url: string, options: RequestOptions): {
    abort(): void;
};
