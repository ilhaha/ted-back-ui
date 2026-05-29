import http from '@/utils/http'

const BASE_URL = '/exam/examRoomSchedule'

export interface ExamRoomScheduleResp {
  id: string
  noticeId: string
  projectId: string
  practicalType: string
  examRoomId: string
  examTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamRoomScheduleDetailResp {
  id: string
  noticeId: string
  projectId: string
  practicalType: string
  examRoomId: string
  examTime: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamRoomScheduleQuery {
  noticeId: string | undefined
  projectId: string | undefined
  practicalType: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface ExamRoomSchedulePageQuery extends ExamRoomScheduleQuery, PageQuery {}

/** @desc 查询检验检测人员考试考场安排列表 */
export function listExamRoomSchedule(query: ExamRoomSchedulePageQuery) {
  return http.get<PageRes<ExamRoomScheduleResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询检验检测人员考试考场安排详情 */
export function getExamRoomSchedule(id: string) {
  return http.get<ExamRoomScheduleDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增检验检测人员考试考场安排 */
export function addExamRoomSchedule(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改检验检测人员考试考场安排 */
export function updateExamRoomSchedule(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除检验检测人员考试考场安排 */
export function deleteExamRoomSchedule(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出检验检测人员考试考场安排 */
export function exportExamRoomSchedule(query: ExamRoomScheduleQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
