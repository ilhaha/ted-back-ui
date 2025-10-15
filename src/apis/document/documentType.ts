import http from '@/utils/http'

const BASE_URL = '/document/documentType'

export interface DocumentTypeResp {
  id: string
  typeName: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface DocumentTypeDetailResp {
  id: string
  typeName: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface DocumentTypeQuery {
  typeName: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface DocumentTypePageQuery extends DocumentTypeQuery, PageQuery {}

/** @desc 查询资料类型主列表 */
export function listDocumentType(query: DocumentTypePageQuery) {
  return http.get<PageRes<DocumentTypeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询资料类型主详情 */
export function getDocumentType(id: string) {
  return http.get<DocumentTypeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增资料类型主 */
export function addDocumentType(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改资料类型主 */
export function updateDocumentType(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除资料类型主 */
export function deleteDocumentType(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出资料类型主 */
export function exportDocumentType(query: DocumentTypeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
