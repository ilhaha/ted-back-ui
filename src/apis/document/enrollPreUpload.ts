import http from '@/utils/http'

const BASE_URL = '/document/enrollPreUpload'

export interface EnrollPreUploadResp {
  id: string
  candidatesId: string
  planId: string
  batchId: string
  qualificationFileUrl: string
  status: string
  remark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface EnrollPreUploadDetailResp {
  id: string
  candidatesId: string
  planId: string
  batchId: string
  qualificationFileUrl: string
  status: string
  remark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface EnrollPreUploadQuery {
  candidatesId: string | undefined
  planId: string | undefined
  qualificationFileUrl: string | undefined
  sort: Array<string>
}
export interface EnrollPreUploadPageQuery extends EnrollPreUploadQuery, PageQuery {}

/** @desc 查询机构报考-考生扫码上传文件列表 */
export function listEnrollPreUpload(query: EnrollPreUploadPageQuery) {
  return http.get<PageRes<EnrollPreUploadResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构报考-考生扫码上传文件详情 */
export function getEnrollPreUpload(id: string) {
  return http.get<EnrollPreUploadDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构报考-考生扫码上传文件 */
export function addEnrollPreUpload(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构报考-考生扫码上传文件 */
export function updateEnrollPreUpload(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构报考-考生扫码上传文件 */
export function deleteEnrollPreUpload(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构报考-考生扫码上传文件 */
export function exportEnrollPreUpload(query: EnrollPreUploadQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
