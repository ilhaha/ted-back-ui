import http from '@/utils/http'

const BASE_URL = '/examconnect/candidatePlanPaper'

export interface CandidatePlanPaperResp {
  id: string
  planId: string
  candidateId: string
  paperJson: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CandidatePlanPaperDetailResp {
  id: string
  planId: string
  candidateId: string
  paperJson: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CandidatePlanPaperQuery {
  planId: string | undefined
  candidateId: string | undefined
  paperJson: string | undefined
  createTime: string | undefined
  updateTime: string | undefined
  isDeleted: string | undefined
  sort: Array<string>
}
export interface CandidatePlanPaperPageQuery extends CandidatePlanPaperQuery, PageQuery {}

/** @desc 查询考生试卷列表 */
export function listCandidatePlanPaper(query: CandidatePlanPaperPageQuery) {
  return http.get<PageRes<CandidatePlanPaperResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生试卷详情 */
export function getCandidatePlanPaper(id: string) {
  return http.get<CandidatePlanPaperDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生试卷 */
export function addCandidatePlanPaper(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生试卷 */
export function updateCandidatePlanPaper(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生试卷 */
export function deleteCandidatePlanPaper(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生试卷 */
export function exportCandidatePlanPaper(query: CandidatePlanPaperQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
