import http from '@/utils/http'

const BASE_URL = '/exam/examIdcard'

export interface ExamIdcardResp {
  id: string
  realName: string
  gender: string
  idCardNumber: string
  educationCertificate: string
  educationVerifyStatus: string
  educationVerifyTime: string
  educationVerifyRemark: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamIdcardDetailResp {
  id: string
  realName: string
  gender: string
  nation: string
  birthDate: string
  address: string
  idCardAddress: string
  idCardNumber: string
  issuingAuthority: string
  validStartDate: string
  validEndDate: string
  idCardPhotoFront: string
  idCardPhotoBack: string
  facePhoto: string
  majorType: string
  education: string
  graduatedSchool: string
  relatedMajor: string
  companyName: string
  qualification: string
  workYears: string
  region: string
  postalCode: string
  educationCertificate: string
  educationVerifyStatus: string
  educationVerifyTime: string
  educationVerifyRemark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamIdcardQuery {
  realName: string | undefined
  idCardNumber: string | undefined
  educationVerifyStatus?: number
  verifyType?: number
  sort: Array<string>
}
export interface ExamIdcardPageQuery extends ExamIdcardQuery, PageQuery {}

/** @desc 查询考生身份证信息列表 */
export function listExamIdcard(query: ExamIdcardPageQuery) {
  return http.get<PageRes<ExamIdcardResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生身份证信息详情 */
export function getExamIdcard(id: string) {
  return http.get<ExamIdcardDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生身份证信息 */
export function addExamIdcard(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生身份证信息 */
export function updateExamIdcard(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生身份证信息 */
export function deleteExamIdcard(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生身份证信息 */
export function exportExamIdcard(query: ExamIdcardQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 审核身份证信息（单个或批量） */
export function auditExamIdcard(data: { ids: string[]; status: number; remark?: string }) {
  return http.put(`${BASE_URL}/audit`, data)
}
