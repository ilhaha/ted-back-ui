import http from '@/utils/http'

const BASE_URL = '/exam/candidateExamPaper'

export interface CandidateExamPaperResp {
  id: string
  enrollId: string
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
export interface CandidateExamPaperDetailResp {
  id: string
  enrollId: string
  paperJson: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CandidateExamPaperQuery {
  enrollId: string | undefined
  paperJson: string | undefined
  createTime: string | undefined
  updateTime: string | undefined
  isDeleted: string | undefined
  sort: Array<string>
}
export interface CandidateExamPaperPageQuery extends CandidateExamPaperQuery, PageQuery {}

/** @desc 查询考生试卷列表 */
export function listCandidateExamPaper(query: CandidateExamPaperPageQuery) {
  return http.get<PageRes<CandidateExamPaperResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生试卷详情 */
export function getCandidateExamPaper(id: string) {
  return http.get<CandidateExamPaperDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生试卷 */
export function addCandidateExamPaper(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生试卷 */
export function updateCandidateExamPaper(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生试卷 */
export function deleteCandidateExamPaper(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生试卷 */
export function exportCandidateExamPaper(query: CandidateExamPaperQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
