import http from '@/utils/http'

const BASE_URL = '/examconnect/examAnswer'

export interface ExamAnswerResp {
  id: string
  candidateId: string
  planId: string
  questionId: string
  sort: string
  stepId: string
  isCorrect: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamAnswerDetailResp {
  id: string
  candidateId: string
  planId: string
  questionId: string
  sort: string
  stepId: string
  isCorrect: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamAnswerQuery {
  candidateId: string | undefined
  sort: Array<string>
}
export interface ExamAnswerPageQuery extends ExamAnswerQuery, PageQuery {}

/** @desc 查询考生答题，记录考生答题情况列表 */
export function listExamAnswer(query: ExamAnswerPageQuery) {
  return http.get<PageRes<ExamAnswerResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生答题，记录考生答题情况详情 */
export function getExamAnswer(id: string) {
  return http.get<ExamAnswerDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生答题，记录考生答题情况 */
export function addExamAnswer(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生答题，记录考生答题情况 */
export function updateExamAnswer(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生答题，记录考生答题情况 */
export function deleteExamAnswer(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生答题，记录考生答题情况 */
export function exportExamAnswer(query: ExamAnswerQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
