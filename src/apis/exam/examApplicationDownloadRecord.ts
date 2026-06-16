import http from '@/utils/http'

const BASE_URL = '/exam/examApplicationDownloadRecord'

export interface ExamApplicationDownloadRecordResp {
  id: string
  noticeId: string
  projectId: string
  candidateId: string
  applyNo: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamApplicationDownloadRecordDetailResp {
  id: string
  noticeId: string
  projectId: string
  candidateId: string
  applyNo: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface ExamApplicationDownloadRecordQuery {
  noticeId: string | undefined
  projectId: string | undefined
  candidateId: string | undefined
  applyNo: string | undefined
  sort: Array<string>
}
export interface ExamApplicationDownloadRecordPageQuery extends ExamApplicationDownloadRecordQuery, PageQuery {}

/** @desc 查询考生申请下载记录列表 */
export function listExamApplicationDownloadRecord(query: ExamApplicationDownloadRecordPageQuery) {
  return http.get<PageRes<ExamApplicationDownloadRecordResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生申请下载记录详情 */
export function getExamApplicationDownloadRecord(id: string) {
  return http.get<ExamApplicationDownloadRecordDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生申请下载记录 */
export function addExamApplicationDownloadRecord(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生申请下载记录 */
export function updateExamApplicationDownloadRecord(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生申请下载记录 */
export function deleteExamApplicationDownloadRecord(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生申请下载记录 */
export function exportExamApplicationDownloadRecord(query: ExamApplicationDownloadRecordQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
