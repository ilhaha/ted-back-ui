import http from '@/utils/http'

const BASE_URL = '/worker/workerApply'

export interface WorkerApplyResp {
  id: string
  candidateId: string
  categoryId: string
  qualificationPath: string
  status: string
  createTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WorkerApplyDetailResp {
  id: string
  candidateId: string
  categoryId: string
  qualificationPath: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface WorkerApplyQuery {
  candidateId: string | undefined
  categoryId: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface WorkerApplyPageQuery extends WorkerApplyQuery, PageQuery {}

/** @desc 审核作业人员报名 */
export function review(data: any) {
  return http.post(`${BASE_URL}/review`, data)
}

/** @desc 作业人员重新提交报名 */
export function workerRestSumbitUpload(data: any) {
  return http.post(`${BASE_URL}/rest/submit`, data)
}

/** @desc 作业人员提交报名 */
export function workerSumbitUpload(data: any) {
  return http.post(`${BASE_URL}/submit`, data)
}

/** @desc 根据身份证后六位、和班级id查询当前身份证报名信息 */
export function verify(data: any) {
  return http.post(`${BASE_URL}/verify`, data)
}

/** @desc 查询作业人员报名列表 */
export function listWorkerApply(query: WorkerApplyPageQuery) {
  return http.get<PageRes<WorkerApplyResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询作业人员报名详情 */
export function getWorkerApply(id: string) {
  return http.get<WorkerApplyDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增作业人员报名 */
export function addWorkerApply(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改作业人员报名 */
export function updateWorkerApply(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除作业人员报名 */
export function deleteWorkerApply(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出作业人员报名 */
export function exportWorkerApply(query: WorkerApplyQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
