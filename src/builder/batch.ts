// https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#_Toc38457781
// support json format for batch request

export interface JsonBatchBundle {
    requests: JsonBatchRequest[];
}

export type JsonBatchMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export type JsonBatchHeaders = Record<string, string>

export interface JsonBatchRequest<T = any> {
    id: string;
    method: JsonBatchMethod;
    url: string;
    atomicityGroup?: string;
    dependsOn?: string[];
    headers?: JsonBatchHeaders;
    body?: T;
}

export interface JsonBatchResponseBundle {
    responses: JsonBatchRequest[]
}

export interface JsonBatchResponse<T = any> {
    id: string;
    status: number;
    body?: any;
    headers?: JsonBatchHeaders;
}
