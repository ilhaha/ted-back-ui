import http from '@/utils/http'

const BASE_URL = '/exam/examAsyncErrorLog'

export interface ExamAsyncErrorLogResp {
  id: string
  planId: string
  enrollId: string
  step: string
  errorMsg: string
  stackTrace: string
  status: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamAsyncErrorLogDetailResp {
  id: string
  planId: string
  enrollId: string
  step: string
  errorMsg: string
  stackTrace: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamAsyncErrorLogQuery {
  sort: Array<string>
}
export interface ExamAsyncErrorLogPageQuery extends ExamAsyncErrorLogQuery, PageQuery {}

/** @desc 查询考试异步任务错误日志列表 */
export function listExamAsyncErrorLog(query: ExamAsyncErrorLogPageQuery) {
  return http.get<PageRes<ExamAsyncErrorLogResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试异步任务错误日志详情 */
export function getExamAsyncErrorLog(id: string) {
  return http.get<ExamAsyncErrorLogDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试异步任务错误日志 */
export function addExamAsyncErrorLog(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试异步任务错误日志 */
export function updateExamAsyncErrorLog(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试异步任务错误日志 */
export function deleteExamAsyncErrorLog(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试异步任务错误日志 */
export function exportExamAsyncErrorLog(query: ExamAsyncErrorLogQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
