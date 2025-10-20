import http from '@/utils/http'

const BASE_URL = '/exam/specialCertificationApplicant'

export interface SpecialCertificationApplicantResp {
  id: string
  candidatesId: string
  candidatesName: string
  imageUrl: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  status: number
  createUserString: string
  updateUserString: string
  disabled: boolean
  planName: string
}
export interface SpecialCertificationApplicantDetailResp {
  id: string
  candidatesId: string
  candidatesName: string
  imageUrl: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  status: number
  remark: string
  batchId: string
  createUserString: string
  updateUserString: string
  planName: string
}
export interface SpecialCertificationApplicantQuery {
  createTime: string | undefined
  updateTime: string | undefined
  sort: Array<string>
}
export interface SpecialCertificationApplicantPageQuery extends SpecialCertificationApplicantQuery, PageQuery {}

export interface BatchAuditSpecialCertificationApplicantDTO {
  ids: string[]
  status: number
  reason?: string
}

/** @desc 查询特种设备人员资格申请列表 */
export function listSpecialCertificationApplicant(query: SpecialCertificationApplicantPageQuery) {
  return http.get<PageRes<SpecialCertificationApplicantResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询特种设备人员资格申请详情 */
export function getSpecialCertificationApplicant(id: string) {
  return http.get<SpecialCertificationApplicantDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增特种设备人员资格申请 */
export function addSpecialCertificationApplicant(data: any) {
  return http.post(`${BASE_URL}`, data)
}

// /** @desc 修改特种设备人员资格申请 */
// export function updateSpecialCertificationApplicant(data: any, id: string) {
//   return http.put(`${BASE_URL}/${id}`, data)
// }

/** @desc 修改特种设备人员资格申请 */
export function updateSpecialCertificationApplicant(data: any, id: string) {
  return http.put(`${BASE_URL}/update/${id}`, data)
}


/** @desc 删除特种设备人员资格申请 */
export function deleteSpecialCertificationApplicant(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出特种设备人员资格申请 */
export function exportSpecialCertificationApplicant(query: SpecialCertificationApplicantQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 批量审核特种设备人员资格申请 */
export function batchAuditSpecialCertificationApplicant(data: BatchAuditSpecialCertificationApplicantDTO) {
  return http.put(`${BASE_URL}/batch-audit`, data)
}

