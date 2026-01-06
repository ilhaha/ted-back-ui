import http from '@/utils/http'

const BASE_URL = '/exam/classroom'

export interface ClassroomResp {
  id: string
  classroomName: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  maxCandidates: string
  createUserString: string
  updateUserString: string
  disabled: boolean

  examLocation: string
}
export interface ClassroomDetailResp {
  id: string
  classroomName: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  maxCandidates: string
  createUserString: string
  updateUserString: string
  examLocation: string
}
export interface ClassroomQuery {
  classroomName: string
  sort: Array<string>
}
export interface ClassroomPageQuery extends ClassroomQuery, PageQuery { }

/** @desc 查询考场列表 */
export function listClassroom(query: ClassroomPageQuery) {
  return http.get<PageRes<ClassroomResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考场详情 */
export function getClassroom(id: string) {
  return http.get<ClassroomDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考场 */
export function addClassroom(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考场 */
export function updateClassroom(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考场 */
export function deleteClassroom(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考场 */
export function exportClassroom(query: ClassroomQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
/** @desc 获取考试地点 */
export function selectExamLocation() {
  return http.get(`${BASE_URL}/getExamLocation`)
}

/** @desc  获取考场列表 */
export function getClassroomList(planId: any) {
  return http.get(`${BASE_URL}/getClassroomList/${planId}`)
}
