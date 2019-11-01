import { RequestResult, UploadProgressEvent } from "@/utils/request";
interface ClientOptions {
    /**
     * access key you create on aliyun console website
     */
    accessKeyId: string;
    /**
     * access secret you create
     */
    accessKeySecret: string;
    bucket: string;
    /**
     * used by temporary authorization
     */
    stsToken?: string;
    /**
     * oss region domain. It takes priority over `region`
     */
    endpoint?: string;
    /**
     * the bucket data region location, default is `oss-cn-hangzhou`
     */
    region?: string;
    /**
     * access OSS with aliyun internal network or not, default is false. If your servers are running on aliyun too,
     * you can set true to save lot of money.
     */
    internal?: boolean;
    /**
     * instance level timeout for all operations, default is 60_000(60s).
     */
    timeout?: number;
    secure?: boolean;
    /**
     * default false, access oss with custom domain name. if true, you can fill endpoint field with your custom domain name
     */
    cname?: boolean;
}
interface PostObjectOptions {
    policy?: string | {
        [key: string]: any;
    };
    signature?: string;
    timeout?: number;
    onProgress?: (e: UploadProgressEvent) => void;
    onSuccess?: (result: RequestResult) => void;
    onError?: (e: Error) => void;
    success_action_status?: number;
    success_action_redirect?: string;
    'x-oss-object-acl'?: string;
    [key: string]: any;
}
declare class Client {
    protected opts: ClientOptions & {
        host: string;
    };
    constructor(options: ClientOptions);
    /**
     * post object as form/multi-part
     * @param name
     * @param file
     * @param options
     */
    postObject(name: string, file: File | Blob, options?: PostObjectOptions): {
        abort(): void;
    };
    /**
     * Get the Object url.
     * If provide baseUrl, will use baseUrl instead the default bucket and endpoint .
     * @param name
     * @param baseUrl
     */
    generateObjectUrl(name: string, baseUrl?: string): string;
}
export default Client;
