import http from '@/utils/http'

const BASE_URL = '/certificate/reexamine'

export interface ReexamineResp {
  id: string
  applicantId: string
  applicantName:string
  certificateId: string
  certificateName:string
  certificateUrl: string
  applicantFormUrl: string
  reexaminStatus: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}

export interface ReexamineDetailResp {
  id: string
  applicantId: string
  applicantName:string
  certificateId: string
  certificateName:string
  certificateUrl: string
  applicantFormUrl: string
  reexaminStatus: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}

export interface ReexamineQuery {
  sort: Array<string>
}
export interface ReexaminePageQuery extends ReexamineQuery, PageQuery {}

/** @desc 查询复审列表 */
export function listReexamine(query: ReexaminePageQuery) {
  return http.get<PageRes<ReexamineResp[]>>(`${BASE_URL}/certificates`, query)
}

/** @desc 查询复审详情 */
export function getReexamine(id: string) {
  return http.get<ReexamineDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增复审 */
export function addReexamine(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改复审 */
export function updateReexamine(data: any, id: string) {
  //输出data
  return http.put(`${BASE_URL}/${id}`, data)
}



/** @desc 删除复审 */
export function deleteReexamine(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出复审 */
export function exportReexamine(query: ReexamineQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

export function updateReexamineStatus(data: any, id: string) {
  //输出data
  return http.put(`${BASE_URL}/zdyupdate/${id}`, data)
}