import http from '@/utils/http'

const BASE_URL = '/training/org'

export interface OrgResp {
  id: string
  code: string
  name: string
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  candidateName: string[]
  creditScore: number
  limitDate: string | null
}
export interface OrgDetailResp {
  id: string
  code: string
  name: string
  categoryNames: string[]
  socialCode: string
  location: string
  legalPerson: string
  scale: string
  businessLicense: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  candidateName: string[]
  nickname: string | null
  phone: string | null
}
export interface OrgQuery {
  code: string | undefined
  sort: Array<string>
}

export interface ProjectCategoryVO {
  label: string
  value: number
  parentId?: number
  children?: ProjectCategoryVO[]
}

export interface OrgPageQuery extends OrgQuery, PageQuery { }

/**
 * 下载成绩单
 * @param planId 
 * @returns 
 */
export function downloadSummaryApi(planId: number) {
  return http.download(`${BASE_URL}/back/download/summary/${planId}`)
}

/** @desc 获取机构对应的分类-项目-班级级联选择 */
export function getSelectCategoryProjectClass(orgId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/category/project/class`, { orgId })
}

/** @desc 获取机构考核项目种类-项目级联选择器 */
export function getSelectCategoryProject(orgId: string) {
  return http.get<ProjectCategoryVO[]>(`${BASE_URL}/select/category/project`, { orgId })
}

/** @desc 获取机构对应的项目-班级-考生级联选择 */
export function getSelectOrgProjectClass(type: number) {
  return http.get<any[]>(`${BASE_URL}/select/org/project/class/${type}`)
}

/** @desc 获取所有的机构作为选择器返回 */
export function getOrgSelect() {
  return http.get(`${BASE_URL}/select`)
}

/** @desc 查询机构信息列表 */
export function listOrg(query: OrgPageQuery) {
  return http.get<PageRes<OrgResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机构信息详情 */
export function getOrg(id: string) {
  return http.get<OrgDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增机构信息 */
export function addOrg(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改机构信息 */
export function updateOrg(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除机构及关联用户信息 */
export function deleteOrg(id: string) {
  return http.del(`${BASE_URL}/remove/${id}`)
}

/** @desc 导出机构信息 */
export function exportOrg(query: OrgQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/**@desc 导入机构考生关联信息 */
export function getStudents(id: string) {
  return http.get(`${BASE_URL}/${id}`)
}

/** @desc 获取机构账号列表 */
export function getOrgAccounts(id: string) {
  return http.get(`${BASE_URL}/accounts/${id}`)
}

/**@desc 获取可绑定的用户列表 */
export function getBindableUsers() {
  return http.get<Array<{ id: string; nickname: string }>>(`${BASE_URL}/bindable-users`)
}

/**@desc 绑定用户到机构 */
export function bindUserToOrg(orgId: string, userId: string) {
  return http.post(`${BASE_URL}/bind-user`, { orgId, userId })
}

/**@desc 绑定机构用户 */
export function unbindOrgAccount(orgId: string) {
  return http.post(`${BASE_URL}/unbind-user/${orgId}`)
}

/** @desc 修改机构违规限制日期 */
export function updateOrgLimitDate(id: string, limitDate: string) {
  return http.put(`${BASE_URL}/limitDate/${id}`, { limitDate })
}
