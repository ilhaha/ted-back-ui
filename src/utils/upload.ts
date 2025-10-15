import http from '@/utils/http'

/** @desc 上传文件 */
export function upload(data: FormData) {
    return http.post(`/upload/file`, data)
}