import http from '@/utils/http'

const BASE_URL = '/certificate/certificateProject'

export interface CertificateProjectResp {
  id: string
  certificateId: string
  projectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CertificateProjectDetailResp {
  id: string
  certificateId: string
  projectId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CertificateProjectQuery {
  sort: Array<string>
}
export interface CertificateProjectPageQuery extends CertificateProjectQuery, PageQuery {}

/** @desc 查询证件项目关联列表 */
export function listCertificateProject(query: CertificateProjectPageQuery) {
  return http.get<PageRes<CertificateProjectResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询证件项目关联详情 */
export function getCertificateProject(id: string) {
  return http.get<CertificateProjectDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增证件项目关联 */
export function addCertificateProject(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改证件项目关联 */
export function updateCertificateProject(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除证件项目关联 */
export function deleteCertificateProject(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出证件项目关联 */
export function exportCertificateProject(query: CertificateProjectQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
