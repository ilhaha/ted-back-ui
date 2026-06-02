import http from '@/utils/http'

const BASE_URL = '/exam/admissionTicketRecord'

export interface AdmissionTicketRecordResp {
  id: string
  noticeId: string
  projectId: string
  candidateId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface AdmissionTicketRecordDetailResp {
  id: string
  noticeId: string
  projectId: string
  candidateId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface AdmissionTicketRecordQuery {
  noticeId: string | undefined
  projectId: string | undefined
  candidateId: string | undefined
  sort: Array<string>
}
export interface AdmissionTicketRecordPageQuery extends AdmissionTicketRecordQuery, PageQuery {}

/** @desc 查询下载准考证记录列表 */
export function listAdmissionTicketRecord(query: AdmissionTicketRecordPageQuery) {
  return http.get<PageRes<AdmissionTicketRecordResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询下载准考证记录详情 */
export function getAdmissionTicketRecord(id: string) {
  return http.get<AdmissionTicketRecordDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增下载准考证记录 */
export function addAdmissionTicketRecord(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改下载准考证记录 */
export function updateAdmissionTicketRecord(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除下载准考证记录 */
export function deleteAdmissionTicketRecord(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出下载准考证记录 */
export function exportAdmissionTicketRecord(query: AdmissionTicketRecordQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
