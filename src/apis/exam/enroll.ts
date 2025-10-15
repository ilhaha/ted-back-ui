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
export interface EnrollPageQuery extends EnrollQuery, PageQuery {}

/** @desc 查询考生报名表列表 */
export function listEnroll(query: EnrollPageQuery) {
  return http.get<PageRes<EnrollResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生报名表详情 */
export function getEnroll(id: string) {
  return http.get<EnrollDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生报名表 */
export function addEnroll(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生报名表 */
export function updateEnroll(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生报名表 */
export function deleteEnroll(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生报名表 */
export function exportEnroll(query: EnrollQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
