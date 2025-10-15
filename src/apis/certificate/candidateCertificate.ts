import http from '@/utils/http'

const BASE_URL = '/certificate/candidateCertificate'
export interface CandidateCertificateResp {
  id: string
  candidateId: string
  candidateTypeName: string
  certificateId: string
  projectName: string
  certificateStatus: string
  certificateNumber: string
  issuerId: string
  issuerName: string
  holdingDate: string
  expiryDate: string
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
export interface CandidateCertificateDetailResp {
  id: string
  candidateId: string
  candidateTypeName: string
  certificateId: string
  projectName: string
  certificateStatus: string
  certificateNumber: string
  issuerId: string
  issuerName: string
  holdingDate: string
  expiryDate: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CandidateCertificateQuery {
  certificateId: string | undefined
  certificateStatus: string | undefined
  certificateNumber: string | undefined
  issuerId: string | undefined
  sort: Array<string>
}
export interface CandidateCertificatePageQuery extends CandidateCertificateQuery, PageQuery {}


/** @desc 查询考生证件列表 */
export function listCandidateCertificate(query: CandidateCertificatePageQuery) {
  return http.get<PageRes<CandidateCertificateResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生证件详情 */
export function getCandidateCertificate(id: string) {
  return http.get<CandidateCertificateDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生证件 */
export function addCandidateCertificate(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生证件 */
export function updateCandidateCertificate(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生证件 */
export function deleteCandidateCertificate(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生证件 */
export function exportCandidateCertificate(query: CandidateCertificateQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
