import http from '@/utils/http'

const BASE_URL = '/exam/examNoticePlan'

export interface ExamNoticePlanResp {
  id: string
  noticeId: string
  planId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamNoticePlanDetailResp {
  id: string
  noticeId: string
  planId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamNoticePlanQuery {
  noticeId: string | undefined
  planId: string | undefined
  sort: Array<string>
}
export interface ExamNoticePlanPageQuery extends ExamNoticePlanQuery, PageQuery {}

/** @desc 查询考试通知与考试计划关联列表 */
export function listExamNoticePlan(query: ExamNoticePlanPageQuery) {
  return http.get<PageRes<ExamNoticePlanResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试通知与考试计划关联详情 */
export function getExamNoticePlan(id: string) {
  return http.get<ExamNoticePlanDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试通知与考试计划关联 */
export function addExamNoticePlan(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试通知与考试计划关联 */
export function updateExamNoticePlan(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试通知与考试计划关联 */
export function deleteExamNoticePlan(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试通知与考试计划关联 */
export function exportExamNoticePlan(query: ExamNoticePlanQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
