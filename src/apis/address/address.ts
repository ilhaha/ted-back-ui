import http from '@/utils/http'

const BASE_URL = '/address'

/** @desc 获取省份城市列表 */
export function list() {
    return http.get(`${BASE_URL}/list`)
}

export function provinces() {
    return http.get(`${BASE_URL}/provinces`)
}

export function ilhahaProvinces() {
    return http.get(`${BASE_URL}/ilhaha/provinces`)
}

export function citys(id: string) {
    return http.get(`${BASE_URL}/getChild?pid=${id}`)
}