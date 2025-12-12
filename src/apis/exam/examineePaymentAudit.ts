import http from '@/utils/http'

const BASE_URL = '/exam/examineePaymentAudit'

export interface ExamineePaymentAuditResp {
  id: string
  examPlanId: string
  examineeId: string
  enrollId: string
  paymentAmount: string
  paymentTime: string
  paymentProofUrl: string
  auditNoticeUrl: string
  auditStatus: string
  rejectReason: string
  auditorId: string
  auditTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  noticeNo:string
}
export interface ExamineePaymentAuditDetailResp {
  id: string
  examPlanId: string
  examineeId: string
  enrollId: string
  noticeNo:string
  paymentAmount: string
  paymentTime: string
  paymentProofUrl: string
  auditNoticeUrl: string
  auditStatus: string
  rejectReason: string
  auditorId: string
  auditTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamineePaymentAuditQuery {
  examPlanId: string | undefined
  examineeId: string | undefined
  auditStatus: string | undefined
  classId: string | undefined
  sort: Array<string>
}
export interface ExamineePaymentAuditPageQuery extends ExamineePaymentAuditQuery, PageQuery {}

/** @desc 查询考生缴费审核列表 */
export function listExamineePaymentAudit(query: ExamineePaymentAuditPageQuery) {
  return http.get<PageRes<ExamineePaymentAuditResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生缴费审核详情 */
export function getExamineePaymentAudit(id: string) {
  return http.get<ExamineePaymentAuditDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生缴费审核 */
export function addExamineePaymentAudit(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生缴费审核 */
export function updateExamineePaymentAudit(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生缴费审核 */
export function deleteExamineePaymentAudit(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生缴费审核 */
export function exportExamineePaymentAudit(query: ExamineePaymentAuditQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 考生缴费审核 */
export function reviewPayment(query: any) {
  return http.post(`${BASE_URL}/reviewPayment`, query)
}

