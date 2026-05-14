import http from '@/utils/http'

const BASE_URL = '/exam/examineeNoticeApply'

export interface ExamineeNoticeApplyResp {
  id: string
  examineeId: string
  noticeId: string
  status: string
  remark: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamineeNoticeApplyDetailResp {
  id: string
  examineeId: string
  noticeId: string
  status: string
  remark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamineeNoticeApplyQuery {
  examineeId: string | undefined
  noticeId: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface ExamineeNoticeApplyPageQuery extends ExamineeNoticeApplyQuery, PageQuery { }

/** @desc 获取考生报考详情 */
export function getCandidateApplyDetail(applyId: string) {
  return http.get<any>(`${BASE_URL}/apply/detail/${applyId}`)
}

/** @desc 获取通知对应的考生报名列表 */
export function getNoticeApplyCandidatePage(query: ExamineeNoticeApplyPageQuery) {
  return http.get<PageRes<ExamineeNoticeApplyResp[]>>(`${BASE_URL}/candidate/page`, query)
}

/** @desc 查询考生资料关系列表 */
export function listExamineeNoticeApply(query: ExamineeNoticeApplyPageQuery) {
  return http.get<PageRes<ExamineeNoticeApplyResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考生资料关系详情 */
export function getExamineeNoticeApply(id: string) {
  return http.get<ExamineeNoticeApplyDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考生资料关系 */
export function addExamineeNoticeApply(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考生资料关系 */
export function updateExamineeNoticeApply(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考生资料关系 */
export function deleteExamineeNoticeApply(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考生资料关系 */
export function exportExamineeNoticeApply(query: ExamineeNoticeApplyQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 审核 */
export function auditExamineeNoticeApply(data: any) {
  return http.post(`${BASE_URL}/audit`, data)
}
