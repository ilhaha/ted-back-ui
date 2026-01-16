import http from '@/utils/http'

const BASE_URL = '/exam/weldingExamApplication'

export interface WeldingExamApplicationResp {
  id: string
  orgId: string
  weldingType: string
  projectName: string
  projectCode: string
  applicationReason: string
  status: string
  reviewComment: string
  submittedAt: string
  reviewedAt: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WeldingExamApplicationDetailResp {
  id: string
  orgId: string
  weldingType: string
  projectName: string
  projectCode: string
  applicationReason: string
  status: string
  reviewComment: string
  submittedAt: string
  reviewedAt: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface WeldingExamApplicationQuery {
  weldingType: string | undefined
  projectCode: string | undefined
  orgName: string | undefined
  isOrgQuery: boolean
  sort: Array<string>
}
export interface WeldingExamApplicationPageQuery extends WeldingExamApplicationQuery, PageQuery { }



/** @desc 审核焊接项目申请 */
export function reviewWeldingExamApplication(data: any) {
  return http.post(`${BASE_URL}/review`, data)
}


/** @desc 查询机构申请焊接考试项目列表 */
export function listWeldingExamApplication(query: WeldingExamApplicationPageQuery) {
  return http.get<PageRes<WeldingExamApplicationResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构申请焊接考试项目详情 */
export function getWeldingExamApplication(id: string) {
  return http.get<WeldingExamApplicationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构申请焊接考试项目 */
export function addWeldingExamApplication(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构申请焊接考试项目 */
export function updateWeldingExamApplication(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构申请焊接考试项目 */
export function deleteWeldingExamApplication(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出机构申请焊接考试项目 */
export function exportWeldingExamApplication(query: WeldingExamApplicationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
