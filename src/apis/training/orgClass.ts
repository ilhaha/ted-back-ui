import http from '@/utils/http'

const BASE_URL = '/training/orgClass'

export interface OrgClassResp {
  id: string
  orgId: string
  projectId: string
  className: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface OrgClassDetailResp {
  id: string
  orgId: string
  projectId: string
  className: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface OrgClassQuery {
  projectId: string | undefined
  className: string | undefined
  sort: Array<string>
}
export interface OrgClassPageQuery extends OrgClassQuery, PageQuery {}

/** @desc 查询培训机构班级列表 */
export function listOrgClass(query: OrgClassPageQuery) {
  return http.get<PageRes<OrgClassResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询培训机构班级详情 */
export function getOrgClass(id: string) {
  return http.get<OrgClassDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增培训机构班级 */
export function addOrgClass(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改培训机构班级 */
export function updateOrgClass(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除培训机构班级 */
export function deleteOrgClass(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出培训机构班级 */
export function exportOrgClass(query: OrgClassQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
