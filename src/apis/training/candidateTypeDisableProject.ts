import http from '@/utils/http'

const BASE_URL = '/training/candidateTypeDisableProject'

export interface CandidateTypeDisableProjectResp {
  id: string
  candidateTypeId: string
  disableProjectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CandidateTypeDisableProjectDetailResp {
  id: string
  candidateTypeId: string
  disableProjectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CandidateTypeDisableProjectQuery {
  candidateTypeId: string | undefined
  disableProjectId: string | undefined
  sort: Array<string>
}
export interface CandidateTypeDisableProjectPageQuery extends CandidateTypeDisableProjectQuery, PageQuery {}

/** @desc 查询考生类型与禁考项目关联列表 */
export function listCandidateTypeDisableProject(query: CandidateTypeDisableProjectPageQuery) {
  return http.get<PageRes<CandidateTypeDisableProjectResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生类型与禁考项目关联详情 */
export function getCandidateTypeDisableProject(id: string) {
  return http.get<CandidateTypeDisableProjectDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生类型与禁考项目关联 */
export function addCandidateTypeDisableProject(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生类型与禁考项目关联 */
export function updateCandidateTypeDisableProject(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生类型与禁考项目关联 */
export function deleteCandidateTypeDisableProject(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生类型与禁考项目关联 */
export function exportCandidateTypeDisableProject(query: CandidateTypeDisableProjectQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
