import http from '@/utils/http'

const BASE_URL = '/exam/enroll'




export interface EnrollResp {
  id: string
  userId: string
  examPlanId: string
  enrollStatus: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUser: string
  updateUser: string
  examNumber: string
  classroomId: string
  seatId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface EnrollDetailResp {
  id: string
  userId: string
  examPlanId: string
  enrollStatus: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUser: string
  updateUser: string
  examNumber: string
  classroomId: string
  seatId: string
  createUserString: string
  updateUserString: string
}
export interface EnrollQuery {
  nickName: string | undefined
  planName: string | undefined
  enrollStatus: string | undefined
  sort: Array<string>
}
export interface EnrollPageQuery extends EnrollQuery, PageQuery { }

export interface EnrollReq {
  enrollStatus: number;
  examPlanId: number;
}


/**
 * 监考员给考生补考机会
 * @param plan 
 * @returns 
 */
export const makeUpExamApi = (data: any) => {
  return http.post(`${BASE_URL}/makeUp/exam`, data)
}


/**
 * 获取考试计划对应考场的所有考生
 * @returns 
 */
export const getExamCandidates = (planId: number, classroomId: string, params: EnrollPageQuery) => {
  return http.get(`${BASE_URL}/candidates/${planId}/${classroomId}`, params)
}


// 下载某个班级的考试准考证
export function downloadBatchTicket(classId: number, planId: number) {
  return http.download(`${BASE_URL}/download/batch/ticket/${classId}/${planId}`)
}

// 下载某个考生的准考证
export function downloadTicketSingle(id: number) {
  return http.download(`${BASE_URL}/download/ticket/${id}`)
}

// 下载某个班级的考试缴费通知单
export function downloadBatchAuditNotice(classId: number, planId: number) {
  return http.download(`${BASE_URL}/download/batch/auditNotice/${classId}/${planId}`)
}

// 下载某个考生的缴费通知单
export function downloadAuditNoticeSingle(id: number) {
  return http.download(`${BASE_URL}/download/auditNotice/${id}`)
}

/** @desc 考生考试报名*/
export function singUp(data: EnrollReq) {
  return http.post(`${BASE_URL}/singUp`, data)
}
/** @desc 查询考生报名表列表 */
export function listEnroll(query: EnrollPageQuery) {
  return http.get<PageRes<EnrollResp[]>>(`${BASE_URL}`, query)
}

/** @desc 删除考生报名表 */
export function deleteEnroll(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 校验考试时间*/
export function checkEnrolledTime(examPlanId: number) {
  return http.get(`${BASE_URL}/checkEnrollTime?examPlanId=${examPlanId}`)
}
/** @desc 考生取消报名*/
export function cancelEnroll(examPlanId: number) {
  return http.get(`${BASE_URL}/cancelEnroll/${examPlanId}`)
}
/** @desc 下载准考证 PDF */
export async function downloadExamTicket(userId, examNumber) {
  const res = await http.post(
    '/api/exam/ticket/download',
    { userId, examNumber },
    {
      responseType: 'blob',
      timeout: 30000
    }
  )

  // 若 http 封装返回 res.data，则直接返回
  return res?.data || res
}
/**
 * @desc 根据考试计划ID和考生ID获取缴费审核信息
 * @param {number} examPlanId - 考试计划ID
 * @param {number} examineeId - 考生ID
 */
export async function getExamineePaymentAuditInfo(examPlanId: number, examineeId: string) {
  return http.get('/exam/examineePaymentAudit/info', { examPlanId, examineeId });
}
/**
 * @desc 考生提交缴费凭证（保存上传的URL）
 * @param {number} examPlanId - 考试计划ID
 * @param {string} examineeId - 考生ID
 * @param {string} paymentProofUrl - 上传后的缴费凭证URL
 */
export async function submitExamineePaymentProof(
  examPlanId: number,
  examineeId: string,
  paymentProofUrl: string,
  auditStatus: number
) {
  return http.post('/exam/examineePaymentAudit/payment/uploadProof', {
    examPlanId,
    examineeId,
    paymentProofUrl,
    auditStatus
  });
}



