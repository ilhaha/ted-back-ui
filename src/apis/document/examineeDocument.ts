import http from '@/utils/http'

const BASE_URL = '/document/examineeDocument'

export interface ExamineeDocumentResp {
  id: string
  examineeId: string
  documentId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamineeDocumentDetailResp {
  id: string
  examineeId: string
  documentId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamineeDocumentQuery {
  examineeId: string | undefined
  documentId: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface ExamineeDocumentPageQuery extends ExamineeDocumentQuery, PageQuery {}

/** @desc 查询考生资料关系列表 */
export function listExamineeDocument(query: ExamineeDocumentPageQuery) {
  return http.get<PageRes<ExamineeDocumentResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生资料关系详情 */
export function getExamineeDocument(id: string) {
  return http.get<ExamineeDocumentDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生资料关系 */
export function addExamineeDocument(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生资料关系 */
export function updateExamineeDocument(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生资料关系 */
export function deleteExamineeDocument(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生资料关系 */
export function exportExamineeDocument(query: ExamineeDocumentQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
