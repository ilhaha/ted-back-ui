import http from '@/utils/http'

const BASE_URL = '/document/documentPre'

export interface DocumentPreResp {
  id: string
  enrollPreUploadId: string
  docPath: string
  typeId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface DocumentPreDetailResp {
  id: string
  enrollPreUploadId: string
  docPath: string
  typeId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface DocumentPreQuery {
  enrollPreUploadId: string | undefined
  docPath: string | undefined
  typeId: string | undefined
  sort: Array<string>
}
export interface DocumentPrePageQuery extends DocumentPreQuery, PageQuery {}

/** @desc 查询机构报考-考生上传资料列表 */
export function listDocumentPre(query: DocumentPrePageQuery) {
  return http.get<PageRes<DocumentPreResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构报考-考生上传资料详情 */
export function getDocumentPre(id: string) {
  return http.get<DocumentPreDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构报考-考生上传资料 */
export function addDocumentPre(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构报考-考生上传资料 */
export function updateDocumentPre(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构报考-考生上传资料 */
export function deleteDocumentPre(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构报考-考生上传资料 */
export function exportDocumentPre(query: DocumentPreQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
