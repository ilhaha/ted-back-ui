import http from '@/utils/http'

const BASE_URL = '/exam/locationClassroom'

export interface LocationClassroomResp {
  id: string
  locationId: string
  classroomId: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface LocationClassroomDetailResp {
  id: string
  locationId: string
  classroomId: string
  createUserString: string
  updateUserString: string
}
export interface LocationClassroomQuery {
  sort: Array<string>
}
export interface LocationClassroomPageQuery extends LocationClassroomQuery, PageQuery {}

/** @desc 查询考场地点和考场关联列表 */
export function listLocationClassroom(query: LocationClassroomPageQuery) {
  return http.get<PageRes<LocationClassroomResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考场地点和考场关联详情 */
export function getLocationClassroom(id: string) {
  return http.get<LocationClassroomDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考场地点和考场关联 */
export function addLocationClassroom(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考场地点和考场关联 */
export function updateLocationClassroom(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考场地点和考场关联 */
export function deleteLocationClassroom(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考场地点和考场关联 */
export function exportLocationClassroom(query: LocationClassroomQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
