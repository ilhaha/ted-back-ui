import http from '@/utils/http'

const BASE_URL = '/exam/examViolation'

export interface ExamViolationResp {
  id: string
  planId: string
  candidateId: string
  violationDesc: string
  illegalUrl: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamViolationDetailResp {
  id: string
  planId: string
  candidateId: string
  violationDesc: string
  illegalUrl: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface ExamViolationQuery {
  planId: string | undefined
  candidateId: string | undefined
  violationDesc: string | undefined
  sort: Array<string>
}
export interface ExamViolationPageQuery extends ExamViolationQuery, PageQuery {}

/** @desc 查询考试劳务费配置列表 */
export function listExamViolation(query: ExamViolationPageQuery) {
  return http.get<PageRes<ExamViolationResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试劳务费配置详情 */
export function getExamViolation(id: string) {
  return http.get<ExamViolationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试劳务费配置 */
export function addExamViolation(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试劳务费配置 */
export function updateExamViolation(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试劳务费配置 */
export function deleteExamViolation(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试劳务费配置 */
export function exportExamViolation(query: ExamViolationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
