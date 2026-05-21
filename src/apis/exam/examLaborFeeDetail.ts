import http from '@/utils/http'

const BASE_URL = '/exam/examLaborFeeDetail'

export interface ExamLaborFeeDetailResp {
  examinerId: string
  categoryId: string
  invigilateInfo: string
  invigilateClassName: string
  invigilateDate: string
  invigilateDurationDays: string
  isTeamLeader: string
  actualLaborFeeAmount: string
  remark: string
  createUser: string
  createTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ExamLaborFeeDetailDetailResp {
  id: string
  examinerId: string
  categoryId: string
  invigilateInfo: string
  invigilateClassName: string
  invigilateDate: string
  invigilateDurationDays: string
  isTeamLeader: string
  actualLaborFeeAmount: string
  remark: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ExamLaborFeeDetailQuery {
  examinerId: string | undefined
  categoryId: string | undefined
  invigilateDate: string | undefined
  sort: Array<string>
}
export interface ExamLaborFeeDetailPageQuery extends ExamLaborFeeDetailQuery, PageQuery {}

/** @desc 查询考试考评人员劳务费计算明细列表 */
export function listExamLaborFeeDetail(query: ExamLaborFeeDetailPageQuery) {
  return http.get<PageRes<ExamLaborFeeDetailResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试考评人员劳务费计算明细详情 */
export function getExamLaborFeeDetail(id: string) {
  return http.get<ExamLaborFeeDetailDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试考评人员劳务费计算明细 */
export function addExamLaborFeeDetail(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试考评人员劳务费计算明细 */
export function updateExamLaborFeeDetail(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试考评人员劳务费计算明细 */
export function deleteExamLaborFeeDetail(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试考评人员劳务费计算明细 */
export function exportExamLaborFeeDetail(query: ExamLaborFeeDetailQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
