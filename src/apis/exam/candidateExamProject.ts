import http from '@/utils/http'

const BASE_URL = '/exam/candidateExamProject'

export interface CandidateExamProjectResp {
  id: string
  candidateId: string
  projectId: string
  attemptNo: string
  usedMakeup: string
  passed: string
  passTime: string
  certificateExpireTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CandidateExamProjectDetailResp {
  id: string
  candidateId: string
  projectId: string
  attemptNo: string
  usedMakeup: string
  passed: string
  passTime: string
  certificateExpireTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CandidateExamProjectQuery {
  candidateId: string | undefined
  projectId: string | undefined
  attemptNo: string | undefined
  usedMakeup: string | undefined
  passed: string | undefined
  createTime: string | undefined
  updateTime: string | undefined
  isDeleted: string | undefined
  sort: Array<string>
}
export interface CandidateExamProjectPageQuery extends CandidateExamProjectQuery, PageQuery {}

/** @desc 查询考生-考试项目考试状态列表 */
export function listCandidateExamProject(query: CandidateExamProjectPageQuery) {
  return http.get<PageRes<CandidateExamProjectResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生-考试项目考试状态详情 */
export function getCandidateExamProject(id: string) {
  return http.get<CandidateExamProjectDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生-考试项目考试状态 */
export function addCandidateExamProject(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生-考试项目考试状态 */
export function updateCandidateExamProject(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生-考试项目考试状态 */
export function deleteCandidateExamProject(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生-考试项目考试状态 */
export function exportCandidateExamProject(query: CandidateExamProjectQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
