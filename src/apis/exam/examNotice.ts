import http from '@/utils/http'

const BASE_URL = '/exam/examNotice'

export interface ExamNoticeResp {
  id: string
  title: string
  applyDeadline: string
  categoryId: string
  categoryName: string
  projectCodes: string
  isTypeTest: number
  isConfirm: number
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
  examType: number
  gradeReleaseStatus: number
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
  isTypeTest: number
  isConfirm: number
  projectList: Array<{
    projectId: string
    projectCode: string
    examTime: string
  }>
}
export interface ExamNoticeQuery {
  title: string | undefined
  applyDeadline: string | undefined
  examLevel: string | undefined
  status: string | undefined
  categoryId?: string | number
  categoryType?: number
  isTypeTest?: number
  sort: Array<string>
}
export interface ExamNoticePageQuery extends ExamNoticeQuery, PageQuery { }

/** @desc 获取其它培训通知列表 */
export function otherTrainingPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/otherTraining/page`, query)
}

/** @desc 获取准考证管理通知列表 */
export function admissionTicketPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/admissionTicket/page`, query)
}

/** @desc 获取成绩管理通知列表 */
export function gradePage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/grade/page`, query)
}

export interface GradeProjectAssessmentResp {
  projectId: string | number
  projectCode: string
  assessmentList: Array<{
    assessmentKey: string
    assessmentName: string
  }>
}

/** @desc 获取成绩详情表头 */
export function getGradeDetailHeader(noticeId: string) {
  return http.get<GradeProjectAssessmentResp[]>(`${BASE_URL}/grade/header/${noticeId}`)
}

export interface GradeDetailDataResp {
  candidateId: string | number
  sort: string | number
  idCard: string
  name: string
  scores: Record<string, Record<string, any>>
}

/** @desc 获取成绩详情数据 */
export function getGradeDetailData(noticeId: string, query: { page: number; size: number; name?: string; idCard?: string }) {
  return http.get<PageRes<GradeDetailDataResp[]>>(`${BASE_URL}/grade/detail/${noticeId}`, query)
}

export interface GradeProjectPassCountResp {
  projectId: string | number
  projectCode: string
  passCount: number
}

/** @desc 获取成绩每个项目及格人数 */
export function getGradeProjectPassCount(noticeId: string) {
  return http.get<GradeProjectPassCountResp[]>(`${BASE_URL}/grade/passCount/${noticeId}`)
}

export interface GradeImportScoreItemResp {
  rowNum?: number
  idCard?: string
  name?: string
  examNumber?: string
  projectId?: string | number
  projectCode?: string
  assessmentName?: string
  practicalType?: number
  scoreId?: string | number
  score?: number
  reason?: string
}

export interface GradeImportParseResp {
  validList: GradeImportScoreItemResp[]
  failList: GradeImportScoreItemResp[]
}

/** @desc 解析成绩导入Excel */
export function parseGradeImport(noticeId: string, data: FormData) {
  return http.post<GradeImportParseResp>(`${BASE_URL}/grade/import/parse/${noticeId}`, data)
}

/** @desc 确认导入成绩 */
export function confirmGradeImport(noticeId: string, validList: GradeImportScoreItemResp[]) {
  return http.post<boolean>(`${BASE_URL}/grade/import/confirm/${noticeId}`, { validList })
}

/** @desc 发布成绩 */
export function publishGrade(noticeId: string) {
  return http.post<boolean>(`${BASE_URL}/grade/publish/${noticeId}`)
}

/** @desc 获取网络课堂通知列表 */
export function onlineCourseNoticeAdminPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/onlineCourse/admin/page`, query)
}


/** @desc 获取通知总览列表 */
export function overviewPage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/overview/page`, query)
}

/** @desc 获取检验统计表通知列表 */
export function statisticsTablePage(query: ExamNoticePageQuery) {
  return http.get<PageRes<ExamNoticeResp[]>>(`${BASE_URL}/statistics/table/page`, query)
}

/** @desc 导出检验统计表已缴费培训人员 */
export function exportPaidTrainingUsers(noticeIds: (string | number)[]) {
  return http.download(`${BASE_URL}/statistics/table/training/paid/export`, { noticeIds }, {
    responseType: 'blob'
  })
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

/** @desc 新增无损检测考试通知 */
export function addExamNotice(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 新增检验人员考试通知 */
export function addInspectionExamNotice(data: any) {
  return http.post(`${BASE_URL}/inspection/add`, data)
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

/** @desc 确认考试通知 */
export function confirmExamNotice(id: string) {
  return http.post(`${BASE_URL}/confirm/${id}`)
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

/** @desc 开启/关闭准考证下载 */
export function toggleProjectAdmissionTicketStatus(noticeId: string, projectId: number, status: number, scheduleList?: { scheduleId: number; examRoomId: number | null; examTime: string }[]) {
  return http.post(`${BASE_URL}/admissionTicket/toggle/project`, { noticeId, projectId, status: status === 0 ? 2 : status, scheduleList })
}


/** @desc 导出已下载准考证人员列表 */
export function exportAdmissionTicketRecord(query: {
  noticeId: string
  projectIds: (string | number)[]
}) {
  return http.download(`${BASE_URL}/admissionTicket/record/export`, query, {
    responseType: 'blob'
  })
}

export interface RegistrationFormProjectOption {
  label: string
  value: string | number
}

/** @desc 查询考试报名表可导出项目 */
export function listRegistrationFormProjectOptions(noticeId: string | number) {
  return http.get<RegistrationFormProjectOption[]>(`${BASE_URL}/registration/form/project/options`, { noticeId })
}

/** @desc 导出考试报名表 */
export function exportRegistrationForm(data: {
  noticeId: string | number
  projectIds: (string | number)[]
}) {
  return http.download(`${BASE_URL}/registration/form/export`, undefined, {
    method: 'post',
    data,
    responseType: 'blob'
  })
}
