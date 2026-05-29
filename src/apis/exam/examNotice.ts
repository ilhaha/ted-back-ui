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

/** @desc 获取准考证管理通知列表 */
export function admissionTicketPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/admissionTicket/page`, query)
}


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

// 通知统计项响应
export interface NoticeStatisticsItemResp {
  tableHeader: string           // 表头
  registrationCount: string    // 报名人数
  paymentCount: string         // 交费人数
  passCount: string            // 及格人数
  totalItemCount: string       // 人项总数
  firstExamCount: string       // 初试人数
  makeupExamCount: string      // 补考人数
  scienceBachelorFirstExamCount: string  // 理工科本科及以上初试人数
  practicalMakeupCount: string // 补考各项目人数 - 实操
  openBookMakeupCount: string  // 补考各项目人数 - 开卷
  closedBookMakeupCount: string // 补考各项目人数 - 闭卷
  reviewFilmMakeupCount: string // 补考各项目人数 - 评片
}

// 通知统计响应
export interface NoticeStatisticsResp {
  title: string                // 标题
  applyDeadline: string        // 报名截止时间
  examLevel: number            // 考试等级 0-无 1一级 2 二级
  status: number               // 状态
  projectCodes: string         // 报考项目代码
  itemList: NoticeStatisticsItemResp[] // 统计项列表
}

/** @desc 通知总览-通知统计 */
export function getNoticeStatistics(noticeId: string) {
  return http.get<NoticeStatisticsResp>(`${BASE_URL}/statistics/${noticeId}`)
}

// 报名情况项响应
export interface NoticeRegistrationItemResp {
  tableHeader: string           // 表头
  registrationCount: string    // 报名人数
  paymentCount: string          // 交费人数
  auditPassCount: string       // 审核通过人数
  auditRejectCount: string     // 审核驳回人数
  pendingAuditCount: string    // 待审核人数
}

// 报名情况响应
export interface NoticeRegistrationResp {
  title: string                // 标题
  applyDeadline: string        // 报名截止时间
  examLevel: number            // 考试等级
  status: number               // 状态
  projectCodes: string         // 报考项目代码
  itemList: NoticeRegistrationItemResp[] // 报名情况项列表
}

/** @desc 通知总览-报名情况 */
export function getNoticeRegistration(noticeId: string) {
  return http.get<NoticeRegistrationResp>(`${BASE_URL}/registration/${noticeId}`)
}

// 通知项目汇总响应
export interface NoticeProjectApplyResp {
  projectId: number
  projectCode: string
  totalItemCount: number
}

/** @desc 通知总览-项目汇总 */
export function getNoticeProjectApplyOverview(noticeId: string) {
  return http.get<NoticeProjectApplyResp[]>(`${BASE_URL}/project/overview`, { noticeId })
}

// 报考项目响应
export interface ProjectVo {
  projectId: number
  projectCode: string
}

// 准考证信息响应
export interface AdmissionTicketInfoResp {
  title: string
  admissionTicketStatus: number
  examProjectList: ProjectVo[]
}

/** @desc 准考证管理-获取准考证信息 */
export function getAdmissionTicketInfo(noticeId: string) {
  return http.get<AdmissionTicketInfoResp>(`${BASE_URL}/admissionTicket/info/${noticeId}`)
}

/** @desc 开启/关闭准考证下载 */
export function toggleAdmissionTicketStatus(noticeId: string, status: number) {
  return http.post(`${BASE_URL}/admissionTicket/toggle/${noticeId}/${status}`)
}

/** @desc 导出准考证 */
export function exportAdmissionTicket(noticeId: string, projectIds: (string | number)[]) {
  return http.download(`${BASE_URL}/admissionTicket/export/${noticeId}`, { projectIds })
}
