import http from '@/utils/http'

const BASE_URL = '/exam/licenseHolderInfo'

export interface LicenseHolderInfoResp {
  id: string
  examineeId: string
  projectCode: string
  projectLevel: string
  validStartDate: string
  validEndDate: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface LicenseHolderInfoDetailResp {
  id: string
  examineeId: string
  projectCode: string
  projectLevel: string
  validStartDate: string
  validEndDate: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface LicenseHolderInfoQuery {
  examineeId: string | undefined
  projectCode: string | undefined
  projectLevel: string | undefined
  sort: Array<string>
}
export interface LicenseHolderInfoPageQuery extends LicenseHolderInfoQuery, PageQuery {}

/** @desc 查询持证信息列表 */
export function listLicenseHolderInfo(query: LicenseHolderInfoPageQuery) {
  return http.get<PageRes<LicenseHolderInfoResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询持证信息详情 */
export function getLicenseHolderInfo(id: string) {
  return http.get<LicenseHolderInfoDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增持证信息 */
export function addLicenseHolderInfo(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改持证信息 */
export function updateLicenseHolderInfo(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除持证信息 */
export function deleteLicenseHolderInfo(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出持证信息 */
export function exportLicenseHolderInfo(query: LicenseHolderInfoQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
