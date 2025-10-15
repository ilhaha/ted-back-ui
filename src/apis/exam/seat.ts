import http from '@/utils/http'

const BASE_URL = '/exam/seat'

export interface SeatResp {
  id: string
  computerIp: string
  classroomId: string
  seatId: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface SeatDetailResp {
  id: string
  computerIp: string
  classroomId: string
  seatId: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface SeatQuery {
  sort: Array<string>
}
export interface SeatPageQuery extends SeatQuery, PageQuery {}

/** @desc 查询座位表列表 */
export function listSeat(query: SeatPageQuery) {
  return http.get<PageRes<SeatResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询座位表详情 */
export function getSeat(id: string) {
  return http.get<SeatDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增座位表 */
export function addSeat(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改座位表 */
export function updateSeat(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除座位表 */
export function deleteSeat(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出座位表 */
export function exportSeat(query: SeatQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
