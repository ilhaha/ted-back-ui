import http from '@/utils/http'

const BASE_URL = '/worker/workerExamTicket'

export interface WorkerExamTicketResp {
  id: string
  enrollId: string
  candidateName: string
  ticketUrl: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WorkerExamTicketDetailResp {
  id: string
  enrollId: string
  candidateName: string
  ticketUrl: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface WorkerExamTicketQuery {
  enrollId: string | undefined
  candidateName: string | undefined
  ticketUrl: string | undefined
  createTime: string | undefined
  updateTime: string | undefined
  isDeleted: string | undefined
  sort: Array<string>
}
export interface WorkerExamTicketPageQuery extends WorkerExamTicketQuery, PageQuery {}

/** @desc 查询作业人员准考证列表 */
export function listWorkerExamTicket(query: WorkerExamTicketPageQuery) {
  return http.get<PageRes<WorkerExamTicketResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询作业人员准考证详情 */
export function getWorkerExamTicket(id: string) {
  return http.get<WorkerExamTicketDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增作业人员准考证 */
export function addWorkerExamTicket(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改作业人员准考证 */
export function updateWorkerExamTicket(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除作业人员准考证 */
export function deleteWorkerExamTicket(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出作业人员准考证 */
export function exportWorkerExamTicket(query: WorkerExamTicketQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
