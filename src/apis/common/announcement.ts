import http from '@/utils/http'

const BASE_URL = '/common/announcement'
const DETAIL = `${BASE_URL}/back/detail`
const SELECT = `${BASE_URL}/select`

export interface AnnouncementResp {
  id: string
  title: string
  content: string
  status: string
  createUser: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface AnnouncementDetailResp {
  id: string
  title: string
  content: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface AnnouncementQuery {
  title: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface AnnouncementPageQuery extends AnnouncementQuery, PageQuery {}

/** @desc 查询公告下拉框列表 */
export function selectAnnouncement() {
  return http.get(`${SELECT}`)
}

/** @desc 查询公告管理列表 */
export function listAnnouncement(query: AnnouncementPageQuery) {
  return http.get<PageRes<AnnouncementResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询公告管理详情 */
export function getAnnouncement(id: string) {
  return http.get<AnnouncementDetailResp>(`${DETAIL}/${id}`)
}

/** @desc 新增公告管理 */
export function addAnnouncement(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改公告管理 */
export function updateAnnouncement(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除公告管理 */
export function deleteAnnouncement(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出公告管理 */
export function exportAnnouncement(query: AnnouncementQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 修改公告状态 */
export function updateAnnouncementStatue(id: string, status: number) {
  return http.put(`${BASE_URL}/updateStatusById/${id}/${status}`)
}
