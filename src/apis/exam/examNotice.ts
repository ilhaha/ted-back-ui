import http from '@/utils/http'

const BASE_URL = '/exam/examNotice'

export interface ExamNoticeResp {
  id: string
  title: string
  applyDeadline: string
  categoryId: string
  examLevel: string
  status: string
  remark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamNoticeDetailResp {
  id: string
  title: string
  applyDeadline: string
  categoryId: string
  examLevel: string
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
export interface ExamNoticeQuery {
  title: string | undefined
  applyDeadline: string | undefined
  examLevel: string | undefined
  status: string | undefined
  sort: Array<string>
}
export interface ExamNoticePageQuery extends ExamNoticeQuery, PageQuery {}

/** @desc 获取通知总览列表 */
export function overviewPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/overview/page`, query)
}



/** @desc 查询无损检测、检验人员考试报名审核通知列表 */
export function applyAuditPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/apply/audit/page`, query)
}

/** @desc 查询在线补报通知列表 */
export function supplementaryReportPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/supplementaryReport/page`, query)
}


/** @desc 查询无损检测、检验人员考试通知列表 */
export function listExamNotice(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询无损检测、检验人员考试通知详情 */
export function getExamNotice(id: string) {
  return http.get<ExamNoticeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增无损检测、检验人员考试通知 */
export function addExamNotice(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改无损检测、检验人员考试通知 */
export function updateExamNotice(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除无损检测、检验人员考试通知 */
export function deleteExamNotice(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出无损检测、检验人员考试通知 */
export function exportExamNotice(query: ExamNoticeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 审核考试通知（单个或批量） */
export function auditExamNotice(data: { ids: string[]; status: number }) {
  return http.put(`${BASE_URL}/audit`, data)
}

/** @desc 开启/关闭补报 */
export function openOrCloseSupplementaryReport(noticeId: string, status: number) {
  return http.post(`${BASE_URL}/openOrClose/${noticeId}/${status}`)
}
