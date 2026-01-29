import http from '@/utils/http'

const BASE_URL = '/exam/planApplyClass'

export interface PlanApplyClassResp {
  id: string
  planId: string
  classId: string
  isScoreConfirmed: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface PlanApplyClassDetailResp {
  id: string
  planId: string
  classId: string
  isScoreConfirmed: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface PlanApplyClassQuery {
  planName: string | undefined
}
export interface PlanApplyClassPageQuery extends PlanApplyClassQuery, PageQuery {}

/** @desc 查询考试计划报考班级列表 */
export function listPlanApplyClass(query: PlanApplyClassPageQuery) {
  return http.get<PageRes<PlanApplyClassResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试计划报考班级详情 */
export function getPlanApplyClass(id: string) {
  return http.get<PlanApplyClassDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试计划报考班级 */
export function addPlanApplyClass(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试计划报考班级 */
export function updatePlanApplyClass(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试计划报考班级 */
export function deletePlanApplyClass(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试计划报考班级 */
export function exportPlanApplyClass(query: PlanApplyClassQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
