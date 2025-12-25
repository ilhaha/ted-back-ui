import http from '@/utils/http'

const BASE_URL = '/exam/licenseCertificate'

export interface LicenseCertificateResp {
  id: string
  datasource: string
  infoinputorg: string
  psnName: string
  idcardNo: string
  originalComName: string
  comName: string
  applyType: string
  applyDate: string
  isVerify: string
  isOpr: string
  lcnsKind: string
  lcnsCategory: string
  lcnsNo: string
  certDate: string
  authDate: string
  endDate: string
  originalAuthCom: string
  authCom: string
  remark: string
  state: string
  psnlcnsItem: string
  psnlcnsItemCode: string
  permitScope: string
  detailRemark: string
  detailState: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface LicenseCertificateDetailResp {
  id: string
  datasource: string
  infoinputorg: string
  psnName: string
  idcardNo: string
  originalComName: string
  comName: string
  applyType: string
  applyDate: string
  isVerify: string
  isOpr: string
  lcnsKind: string
  lcnsCategory: string
  lcnsNo: string
  certDate: string
  authDate: string
  endDate: string
  originalAuthCom: string
  authCom: string
  remark: string
  state: string
  psnlcnsItem: string
  psnlcnsItemCode: string
  permitScope: string
  detailRemark: string
  detailState: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface LicenseCertificateQuery {
  psnName: string | undefined
  idcardNo: string | undefined
  sort: Array<string>
}
export interface LicenseCertificatePageQuery extends LicenseCertificateQuery, PageQuery {}

/** @desc 查询人员及许可证书信息列表 */
export function listLicenseCertificate(query: LicenseCertificatePageQuery) {
  return http.get<PageRes<LicenseCertificateResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询人员及许可证书信息详情 */
export function getLicenseCertificate(id: string) {
  return http.get<LicenseCertificateDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增人员及许可证书信息 */
export function addLicenseCertificate(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改人员及许可证书信息 */
export function updateLicenseCertificate(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除人员及许可证书信息 */
export function deleteLicenseCertificate(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出人员及许可证书信息 */
export function exportLicenseCertificate(query: LicenseCertificateQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
