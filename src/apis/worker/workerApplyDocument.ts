import http from '@/utils/http'

const BASE_URL = '/worker/workerApplyDocument'

export interface WorkerApplyDocumentResp {
  id: string
  workerApplyId: string
  docPath: string
  typeId: string
  createUser: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WorkerApplyDocumentDetailResp {
  id: string
  workerApplyId: string
  docPath: string
  typeId: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface WorkerApplyDocumentQuery {
  workerApplyId: string | undefined
  sort: Array<string>
}
export interface WorkerApplyDocumentPageQuery extends WorkerApplyDocumentQuery, PageQuery {}

/** @desc 查询作业人员报名上传的资料列表 */
export function listWorkerApplyDocument(query: WorkerApplyDocumentPageQuery) {
  return http.get<PageRes<WorkerApplyDocumentResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询作业人员报名上传的资料详情 */
export function getWorkerApplyDocument(id: string) {
  return http.get<WorkerApplyDocumentDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增作业人员报名上传的资料 */
export function addWorkerApplyDocument(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改作业人员报名上传的资料 */
export function updateWorkerApplyDocument(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除作业人员报名上传的资料 */
export function deleteWorkerApplyDocument(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出作业人员报名上传的资料 */
export function exportWorkerApplyDocument(query: WorkerApplyDocumentQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
