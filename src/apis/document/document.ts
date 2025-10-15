import http from '@/utils/http'

const BASE_URL = '/document/document'
const TYPE_NAME_URL = `${BASE_URL}/typeName`

export interface DocumentResp {
  id: string
  docPath: string
  typeId: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface DocumentDetailResp {
  id: string
  docPath: string
  typeId: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface DocumentStatusResp {
  id: string
  status: string
}
export interface DocumentQuery {
  docPath: string | undefined
  typeId: string | undefined
  createUser: string | undefined
  sort: Array<string>
}

export interface DocumentPageQuery extends DocumentQuery, PageQuery {}

/** @desc 查询资料核心存储列表 */
export function listDocument(query: DocumentPageQuery) {
  return http.get<PageRes<DocumentResp[]>>(`${BASE_URL}`, query)
}
/** @desc 获取所有资料种类 */
export function getDocumentType() {
  return http.get(`${TYPE_NAME_URL}`)
}
/** @desc 查询资料核心存储详情 */
export function getDocument(id: string) {
  return http.get<DocumentDetailResp>(`${BASE_URL}/${id}`)
}
export function getStatus() {
  return http.get<DocumentDetailResp>(`${BASE_URL}/status`)
}

/** @desc 新增资料核心存储 */
export function addDocument(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改资料核心存储 */
export function updateDocument(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}
export function updateStatus(data: any, id: string) {
  return http.put(`${BASE_URL}/status/${id}`, data)
}
/** @desc 删除资料核心存储 */
export function deleteDocument(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出资料核心存储 */
export function exportDocument(query: DocumentQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
