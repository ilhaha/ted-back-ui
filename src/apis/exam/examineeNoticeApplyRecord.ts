import http from '@/utils/http'

const BASE_URL = '/exam/examineeNoticeApplyRecord'

export interface ExamineeNoticeApplyRecordResp {
  id: string
  applyId: string
  examineeId: string
  noticeId: string
  projectId: string
  planId: string
  examAttemptType: string
  practicalType: string
  createUser: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamineeNoticeApplyRecordDetailResp {
  id: string
  applyId: string
  examineeId: string
  noticeId: string
  projectId: string
  planId: string
  examAttemptType: string
  practicalType: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamineeNoticeApplyRecordQuery {
  applyId: string | undefined
  examineeId: string | undefined
  noticeId: string | undefined
  projectId: string | undefined
  planId: string | undefined
  sort: Array<string>
}
export interface ExamineeNoticeApplyRecordPageQuery extends ExamineeNoticeApplyRecordQuery, PageQuery {}

/** @desc 查询考生报考通知对应项目-计划明细列表 */
export function listExamineeNoticeApplyRecord(query: ExamineeNoticeApplyRecordPageQuery) {
  return http.get<PageRes<ExamineeNoticeApplyRecordResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生报考通知对应项目-计划明细详情 */
export function getExamineeNoticeApplyRecord(id: string) {
  return http.get<ExamineeNoticeApplyRecordDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生报考通知对应项目-计划明细 */
export function addExamineeNoticeApplyRecord(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生报考通知对应项目-计划明细 */
export function updateExamineeNoticeApplyRecord(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生报考通知对应项目-计划明细 */
export function deleteExamineeNoticeApplyRecord(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生报考通知对应项目-计划明细 */
export function exportExamineeNoticeApplyRecord(query: ExamineeNoticeApplyRecordQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
