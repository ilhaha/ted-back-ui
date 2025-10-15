import http from '@/utils/http'

const BASE_URL = '/certificate/certificateType'

export interface CertificateTypeResp {
  id: string
  certificateName: string
  projectName: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  imageUrl: string
}
export interface CertificateTypeDetailResp {
  id: string
  certificateName: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CertificateTypeQuery {
  certificateName: string | undefined
  sort: Array<string>
}
export interface CertificateTypePageQuery extends CertificateTypeQuery, PageQuery {}

/** @desc 查询证件种类列表 */
export function listCertificateType(query: CertificateTypePageQuery) {
  return http.get<PageRes<CertificateTypeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询证件种类详情 */
export function getCertificateType(id: string) {
  return http.get<CertificateTypeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增证件种类 */
export function addCertificateType(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改证件种类 */
export function updateCertificateType(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除证件种类 */
export function deleteCertificateType(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出证件种类 */
export function exportCertificateType(query: CertificateTypeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
