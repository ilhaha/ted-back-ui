import http from '@/utils/http'

const BASE_URL = '/exam/examRecords'

export interface ExamRecordsResp {
  id: string
  planId: string
  planName: string
  candidateId: string
  candidateName: string
  registrationProgress: string
  examScores: string
  operScores: string
  roadScores: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  reviewStatus: string
  createUserString: string
  updateUserString: string
  isCertificateGenerated: number
  disabled: boolean
  examResultStatus: string
  isOperation: number,
  isRoad: number

}
export interface ExamRecordsDetailResp {
  id: string
  planId: string
  planName: string
  candidateId: string
  candidateName: string
  registrationProgress: string
  examScores: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  reviewStatus: string
  createUserString: string
  updateUserString: string
}
export interface ExamRecordsQuery {
  planId: string
  classId: string
  candidateName: string
  className: string
  username: string
  isCertificateGenerated: string
  registrationProgress: string | undefined
  sort: Array<string>
  isOrgQuery: boolean
  candidateId: string
}
export interface ExamRecordsPageQuery extends ExamRecordsQuery, PageQuery { }


/** @desc 下载资格证 */
export function downloadQualificationCertificate(data: any, planType: number) {
  return http.post(`${BASE_URL}/download/${planType}`, data, { responseType: 'blob', timeout: 30000 })
}


/** @desc 生成资格证 */
export function generateQualificationCertificate(data: any) {
  return http.post(`${BASE_URL}/generate`, data)
}

/** @desc 焊接录入实操 */
export function inputWeldingScores(data: any) {
  return http.post(`${BASE_URL}/input/welding`, data)
}

/** @desc 修改理论成绩 */
export function updateExamScores(data: any) {
  return http.post(`${BASE_URL}/update/exam/score`, data)
}


/** @desc 普通项目录入实操或道路成绩 */
export function inputScores(data: any) {
  return http.post(`${BASE_URL}/input`, data)
}

/** @desc 查询某个考生的考试记录列表 */
export function listCandidateExamRecords(query: ExamRecordsPageQuery) {
  return http.get<PageRes<ExamRecordsResp[]>>(`${BASE_URL}/candidate`, query)
}

/** @desc 查询考试记录列表 */
export function listExamRecords(query: ExamRecordsPageQuery) {
  return http.get<PageRes<ExamRecordsResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试记录详情 */
export function getExamRecords(id: string) {
  return http.get<ExamRecordsDetailResp>(`${BASE_URL}/getRecordsById/${id}`)
}

/** @desc 新增考试记录 */
export function addExamRecords(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试记录 */
export function updateExamRecords(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试记录 */
export function deleteExamRecords(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试记录 */
export function exportExamRecords(query: ExamRecordsQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
