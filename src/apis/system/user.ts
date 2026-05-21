import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/system/user'

/** @desc 获取用户解密之后的手机号 */
export function getVerifyPhone(phone: string) {
  return http.get<string>(`${BASE_URL}/verify/phone`, { phone })
}


/** @desc 查询用户名是否存在 */
export function getUserByUserName(query: T.UserQuery) {
  return http.get<T.UserDetailResp>(`${BASE_URL}/getUserByUserName`, query)
}

/** @desc 查询用户列表 */
export function listUser(query: T.UserPageQuery) {
  return http.get<PageRes<T.UserResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询考务人员列表 */
export function listExamStaff(query: T.UserPageQuery) {
  return http.get<PageRes<T.UserResp[]>>(`${BASE_URL}/examStaff/page`, query)
}

/** @desc 查询检验检测考务人员列表 */
export function listExamStaffInspection(query: T.UserPageQuery) {
  return http.get<PageRes<T.UserResp[]>>(`${BASE_URL}/inspection/examStaff/page`, query)
}


/** @desc 查询所有用户列表 */
export function listAllUser(query: Partial<T.UserPageQuery>) {
  return http.get<T.UserResp[]>(`${BASE_URL}/list`, query)
}

/** @desc 查询用户详情 */
export function getUser(id: string) {
  return http.get<T.UserDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增用户 */
export function addUser(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改用户 */
export function updateUser(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除用户 */
export function deleteUser(ids: string | Array<string>) {
  return http.del(`${BASE_URL}/${ids}`)
}

/** @desc 导出用户 */
export function exportUser(query: T.UserQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 下载用户导入模板 */
export function downloadUserImportTemplate() {
  return http.download(`${BASE_URL}/import/template`)
}

/** @desc 解析用户导入数据 */
export function parseImportUser(data: FormData) {
  return http.post(`${BASE_URL}/import/parse`, data)
}

/** @desc 导入用户 */
export function importUser(data: any) {
  return http.post(`${BASE_URL}/import`, data)
}

/** @desc 重置密码 */
export function resetUserPwd(data: any, id: string) {
  return http.patch(`${BASE_URL}/${id}/password`, data)
}

/** @desc 分配角色 */
export function updateUserRole(data: { roleIds: string[] }, id: string) {
  return http.patch(`${BASE_URL}/${id}/role`, data)
}

// 获取所有的监考人员
export function getInvigilates(invigilateList: any, params: any) {
  return http.get(`${BASE_URL}/getInvigilates?${params}`, invigilateList)
}

// 查找监考人员状态以及时间
export function viewInvigilate(invigilateList: any) {
  return http.get(`${BASE_URL}/viewInvigilate`, invigilateList)
}

// 获取监考人员标签
export function invigilateTag(invigilateList: any) {
  return http.get(`${BASE_URL}/invigilateTag`, invigilateList)
}

// 获取已选监考人员
export function getExistInvigilates(examPlanId: any) {
  return http.get(`${BASE_URL}/getExistInvigilates`, { examPlanId })
}

// 添加监考人员
export function addInvigilates(examPlanId: any, invigilatorIds: any, classroomId: any) {
  return http.get(`${BASE_URL}/addInvigilates`, { examPlanId, invigilatorIds, classroomId })
}

// 验证监考人员考场重复
export function verifyInvigilate(invigilateList: any) {
  return http.get(`${BASE_URL}/verifyInvigilate`, invigilateList)
}
/** @desc 删除考务人员 */
export function deleteExamStaff(id: string) {
  return http.del(`${BASE_URL}/examStaff/${id}`);
}
/** @desc 导出监考人员劳务费 */
export function exportExamStaffFee(params: { userId: string, exportDate: string }) {
  return http.download(`${BASE_URL}/examStaff/exportFee`, params)
}
/** @desc 批量导出监考人员劳务费 */
export async function batchExportExamStaffFee(startDate: string, endDate: string, categoryIds?: string[]) {
  return http.download(`${BASE_URL}/examStaff/exportFee/batch`, { startDate, endDate, categoryIds })
}
