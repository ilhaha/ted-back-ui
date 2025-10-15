import http from '@/utils/http'

const BASE_URL = '/examconnect/step'

export interface StepResp {
  id: string
  question: string
  questionBankId: string
  isCorrectAnswer: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface StepDetailResp {
  id: string
  question: string
  questionBankId: string
  isCorrectAnswer: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface StepQuery {
  question: string | undefined
  sort: Array<string>
}
export interface StepPageQuery extends StepQuery, PageQuery {}

/** @desc 查询题目对应所有的选项 */
export function getListByQuestionId(id: string) {
  return http.get<StepResp>(`${BASE_URL}/by/questionId/${id}`)
}

/** @desc 查询步骤，存储题目的不同回答步骤列表 */
export function listStep(query: StepPageQuery) {
  return http.get<PageRes<StepResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询步骤，存储题目的不同回答步骤详情 */
export function getStep(id: string) {
  return http.get<StepDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增步骤，存储题目的不同回答步骤 */
export function addStep(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改步骤，存储题目的不同回答步骤 */
export function updateStep(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除步骤，存储题目的不同回答步骤 */
export function deleteStep(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出步骤，存储题目的不同回答步骤 */
export function exportStep(query: StepQuery) {
  return http.get(`${BASE_URL}/export`, {
    params: query,
    responseType: 'blob'
  })
}
