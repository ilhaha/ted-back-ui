import http from '@/utils/http'

const BASE_URL = '/exam/examRegistration'

export interface ExamRegistrationResp {
  id: string
  candidateId: string
  projectId: string
  planId: string
  practicalType: string
  examDate: string
  examStatus: string
  scoreStatus: string
  examAttemptType: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamRegistrationDetailResp {
  id: string
  candidateId: string
  projectId: string
  planId: string
  practicalType: string
  examDate: string
  examStatus: string
  scoreStatus: string
  examAttemptType: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamRegistrationQuery {
  candidateId: string | undefined
  projectId: string | undefined
  planId: string | undefined
  examStatus: string | undefined
  scoreStatus: string | undefined
  examAttemptType: string | undefined
  sort: Array<string>
}
export interface ExamRegistrationPageQuery extends ExamRegistrationQuery, PageQuery {}

/** @desc 查询检验、检测考试项目记录列表 */
export function listExamRegistration(query: ExamRegistrationPageQuery) {
  return http.get<PageRes<ExamRegistrationResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询检验、检测考试项目记录详情 */
export function getExamRegistration(id: string) {
  return http.get<ExamRegistrationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增检验、检测考试项目记录 */
export function addExamRegistration(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改检验、检测考试项目记录 */
export function updateExamRegistration(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除检验、检测考试项目记录 */
export function deleteExamRegistration(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出检验、检测考试项目记录 */
export function exportExamRegistration(query: ExamRegistrationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
