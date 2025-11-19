import http from '@/utils/http'

const BASE_URL = '/exam/examPlan'
const DEPT_PROJECTS = `${BASE_URL}/dept/projectList`

export interface ExamPlanResp {
  id: string
  examProjectId: string
  planYear: string
  startTime: string
  endTime: string
  locationId: string
  maxCandidates: string
  actualCandidates: string
  status: string
  approvedUsers: string
  approvalTime: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  isFinalConfirmed: String
}
export interface ExamPlanDetailResp {
  id: string
  examProjectId: string
  projectName: string
  planYear: string
  startTime: string
  endTime: string
  locationId: string
  locationName: string
  maxCandidates: string
  actualCandidates: string
  status: string
  approvedUsers: string
  approvalTime: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  classroomId: []
}

export interface ExamProjectResp {
  label: string
  value: string
  disabled: boolean
}

export interface ExamPlanQuery {
  sort: Array<string>
}
export interface ExamPlanPageQuery extends ExamPlanQuery, PageQuery { }

/** @desc 中心主任确认考试 */
export function centerDirectorConform(planId: number, isFinalConfirmed: number) {
  return http.post(`${BASE_URL}/conform/${planId}/${isFinalConfirmed}`)
}

/** @desc 查询考试计划列表 */
export function listExamPlan(query: ExamPlanPageQuery) {
  return http.get<PageRes<ExamPlanResp[]>>(`${BASE_URL}`, query)
}

/** @desc 获取当前部门下所有项目的列表 */
export function deptProjects() {
  return http.post(`${DEPT_PROJECTS}`)
}

/** @desc 查询考试计划详情 */
export function getExamPlan(id: string) {
  const data = http.get<ExamPlanDetailResp>(`${BASE_URL}/${id}`)
  data.then((res) => {
    const item = res.data
    switch (item.status) {
      case 0: item.status = '待主任审核'; break
      case 1: item.status = '待市监局审核'; break
      case 2: item.status = '通过'; break
      case 3: item.status = '考试进行中'; break
      case 4: item.status = '已结束'; break
      case 5: item.status = '未通过'; break
    }
  })
  return data
}

/**
 * 获取当前计划可用监考员
 * @param id 
 * @returns 
 */
export function getAvailableInvigilator(planId: number, rejectedInvigilatorId: number) {
  const res = http.get<[]>(`${BASE_URL}/available/invigilator/${planId}/${rejectedInvigilatorId}`)
  return res
}


/** @desc 重新随机分配考试计划的监考员 */
export function reRandomInvigilators(planId: number, invigilatorNum: number) {
  return http.post(`${BASE_URL}/rest/random/invigilator/${planId}/${invigilatorNum}`)
}


/** @desc 校验导入考试计划导入Excel文件是否正确 */
export function importExcel(file: any) {
  return http.post(`${BASE_URL}/import/excel`, file)
}


export function getExamClassroom(id: string) {
  const res = http.get<[]>(`${BASE_URL}/classroom/${id}`)
  return res
}

/** @desc 新增考试计划 */
export function addExamPlan(data: any) {
  return http.post(`${BASE_URL}`, data)
}

export function customizAddExamPlan(data: any) {
  return http.post(`${BASE_URL}/save`, data)
}

/** @desc 修改考试计划 */
export function updateExamPlan(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 修改考试计划考场 */
export function updateExamPlanClassroom(data: [], id: string) {
  return http.put(`${BASE_URL}/classroom/${id}`, data)
}

/** @desc 删除考试计划 */
export function deleteExamPlan(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试计划 */
export function exportExamPlan(query: ExamPlanQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 查询资料核心存储详情 */
export function getExamPlanId(id: string) {
  return http.get<ExamPlanDetailResp>(`${BASE_URL}/${id}`)
}
/** @desc 考试计划审核 */
export function getExamPlanvalid(id: string, status: number) {
  return http.post<string>(`${BASE_URL}/valid/${id}/${status}`)
}

/**
 * @desc 考试计划下拉框
 */
export function selectOptions() {
  return http.get(`${BASE_URL}/selectOptions`)
}
