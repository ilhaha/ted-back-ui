import http from '@/utils/http'

const BASE_URL = '/invigilate/laborFee'

export interface LaborFeeResp {
  id: string
  practicalFee: string
  theoryFee: string
  remark: string
  isEnabled: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface LaborFeeDetailResp {
  id: string
  practicalFee: string
  theoryFee: string
  remark: string
  isEnabled: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface LaborFeeQuery {
  sort: Array<string>
}
export interface LaborFeePageQuery extends LaborFeeQuery, PageQuery {}

/** @desc 查询考试劳务费配置列表 */
export function listLaborFee(query: LaborFeePageQuery) {
  return http.get<PageRes<LaborFeeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考试劳务费配置详情 */
export function getLaborFee(id: string) {
  return http.get<LaborFeeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试劳务费配置 */
export function addLaborFee(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试劳务费配置 */
export function updateLaborFee(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试劳务费配置 */
export function deleteLaborFee(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出考试劳务费配置 */
export function exportLaborFee(query: LaborFeeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
