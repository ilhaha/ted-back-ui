import http from '@/utils/http'

const BASE_URL = '/exam/planCandidate'

export interface PlanCandidateResp {
  id: string
  planId: string
  candidateId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface PlanCandidateDetailResp {
  id: string
  planId: string
  candidateId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface PlanCandidateQuery {
  planId: string | undefined
  candidateId: string | undefined
  sort: Array<string>
}
export interface PlanCandidatePageQuery extends PlanCandidateQuery, PageQuery {}

/** @desc 查询计划与考生关系列表 */
export function listPlanCandidate(query: PlanCandidatePageQuery) {
  return http.get<PageRes<PlanCandidateResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询计划与考生关系详情 */
export function getPlanCandidate(id: string) {
  return http.get<PlanCandidateDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增计划与考生关系 */
export function addPlanCandidate(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改计划与考生关系 */
export function updatePlanCandidate(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除计划与考生关系 */
export function deletePlanCandidate(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出计划与考生关系 */
export function exportPlanCandidate(query: PlanCandidateQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
