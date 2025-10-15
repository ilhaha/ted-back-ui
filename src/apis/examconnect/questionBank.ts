import http from '@/utils/http'

const BASE_URL = '/examconnect/questionBank'
const OPTIONS = `${BASE_URL}/options`

export interface QuestionBankResp {
  id: string
  categoryId: string
  subCategoryId: string
  knowledgeTypeId: string
  questionType: string
  question: string
  attachment: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface QuestionBankDetailResp {
  id: string
  categoryId: string
  subCategoryId: string
  knowledgeTypeId: string
  questionType: string
  question: string
  attachment: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface QuestionBankQuery {
  categoryId: string | undefined
  sort: Array<string>
}
export interface QuestionBankPageQuery extends QuestionBankQuery, PageQuery {}

/** @desc 获取级联菜单 */
export function getOptions() {
  return http.get(`${OPTIONS}`)
}

/** @desc 查询题库，存储各类题目及其分类信息列表 */
export function listQuestionBank(query: QuestionBankPageQuery) {
  return http.get<PageRes<QuestionBankResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询题库，存储各类题目及其分类信息详情 */
export function getQuestionBank(id: string) {
  return http.get<QuestionBankDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增题库，存储各类题目及其分类信息 */
export function addQuestionBank(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改题库，存储各类题目及其分类信息 */
export function updateQuestionBank(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除题库，存储各类题目及其分类信息 */
export function deleteQuestionBank(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出题库，存储各类题目及其分类信息 */
export function exportQuestionBank(query: QuestionBankQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 导出现有题库，存储各类题目及其分类信息 */
export function exportQuestionsExcel(query: QuestionBankQuery) {
  return http.download(`${BASE_URL}/exportExcel`, query)
}


