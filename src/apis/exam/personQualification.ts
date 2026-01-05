import http from '@/utils/http'

const BASE_URL = '/exam/personQualification'

export interface PersonQualificationResp {
  id: string
  name: string
  idCard: string
  education: string
  phone: string
  employer: string
  qualificationCategoryCode: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  auditStatus: number
}
export interface PersonQualificationDetailResp {
  id: string
  name: string
  idCard: string
  education: string
  phone: string
  employer: string
  qualificationCategoryCode: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  auditStatus: number
}
export interface PersonQualificationQuery {
  name: string | undefined
  idCard: string | undefined
  createUser: string | undefined
  sort: Array<string>
}
export interface PersonQualificationPageQuery extends PersonQualificationQuery, PageQuery { }

/** @desc 查询人员复审信息表列表 */
export function listPersonQualification(query: PersonQualificationPageQuery) {
  return http.get<PageRes<PersonQualificationResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询人员复审信息表详情 */
export function getPersonQualification(id: string) {
  return http.get<PersonQualificationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增人员复审信息表 */
export function addPersonQualification(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改人员复审信息表 */
export function updatePersonQualification(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除人员复审信息表 */
export function deletePersonQualification(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出人员复审信息表 */
export function exportPersonQualification(query: PersonQualificationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
/** @desc 解析上传的Excel */
export function analysisExcel(file: any) {
  return http.post(`${BASE_URL}/analysis/excel`, file)
}
/** @desc 校验导入复审人员信息导入Excel文件是否正确 */
export function importExcel(file: any) {
  return http.post(`${BASE_URL}/import/excel`, file)
}
/** @desc 审核人员复审信息 */
export function auditPersonQualification(
  data: PersonQualificationQuery
) {
  return http.post(`${BASE_URL}/audit`, data)
}

/** @desc 批量审核人员复审信息 */
export function batchAuditPersonQualification(
  data: any[]
) {
  return http.post(`${BASE_URL}/batch/audit`, data)
}


/** @desc 批量添加复审信息 */
export function batchAdd(
  data: any[]
) {
  return http.post(`${BASE_URL}/batch/add`, data)
}