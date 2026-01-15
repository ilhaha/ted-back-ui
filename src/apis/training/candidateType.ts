import http from '@/utils/http'

const BASE_URL = '/training/candidateType'

export interface CandidateTypeResp {
  id: string
  candidateId: string
  type: string
  isBlacklist: string
  blacklistReason: string
  blacklistDurationType: string
  blacklistTime: string
  blacklistEndTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CandidateTypeDetailResp {
  id: string
  candidateId: string
  type: string
  isBlacklist: string
  blacklistReason: string
  blacklistDurationType: string
  blacklistTime: string
  blacklistEndTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CandidateTypeQuery {
  candidateId: string | undefined
  sort: Array<string>
}
export interface CandidateTypePageQuery extends CandidateTypeQuery, PageQuery {}

/** @desc 切换黑名单状态 */
export function blacklistSwitch(data: any) {
  return http.post(`${BASE_URL}/blacklist/switch`, data)
}

/** @desc 查询考生类型列表 */
export function listCandidateType(query: CandidateTypePageQuery) {
  return http.get<PageRes<CandidateTypeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生类型详情 */
export function getCandidateType(id: string) {
  return http.get<CandidateTypeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生类型 */
export function addCandidateType(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生类型 */
export function updateCandidateType(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生类型 */
export function deleteCandidateType(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生类型 */
export function exportCandidateType(query: CandidateTypeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
