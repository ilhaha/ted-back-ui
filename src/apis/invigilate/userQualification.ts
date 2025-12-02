import http from '@/utils/http'

const BASE_URL = '/invigilate/userQualification'

export interface UserQualificationResp {
  id: string
  userId: string
  categoryId: string
  qualificationUrl: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface UserQualificationDetailResp {
  id: string
  userId: string
  categoryId: string
  qualificationUrl: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface UserQualificationQuery {
  userId: string | undefined
  categoryId: string | undefined
  qualificationUrl: string | undefined
  sort: Array<string>
}
export interface UserQualificationPageQuery extends UserQualificationQuery, PageQuery {}

/** @desc 查询监考员资质证明列表 */
export function listUserQualification(query: UserQualificationPageQuery) {
  return http.get<PageRes<UserQualificationResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询监考员资质证明详情 */
export function getUserQualification(id: string) {
  return http.get<UserQualificationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增监考员资质证明 */
export function addUserQualification(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改监考员资质证明 */
export function updateUserQualification(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除监考员资质证明 */
export function deleteUserQualification(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出监考员资质证明 */
export function exportUserQualification(query: UserQualificationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
