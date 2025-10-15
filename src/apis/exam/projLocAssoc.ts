import http from '@/utils/http'

const BASE_URL = '/exam/projLocAssoc'

export interface ProjLocAssocResp {
  id: string
  projectId: string
  locationId: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ProjLocAssocDetailResp {
  id: string
  projectId: string
  locationId: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface ProjLocAssocQuery {
  sort: Array<string>
}
export interface ProjLocAssocPageQuery extends ProjLocAssocQuery, PageQuery {}

/** @desc 查询项目地点关联列表 */
export function listProjLocAssoc(query: ProjLocAssocPageQuery) {
  return http.get<PageRes<ProjLocAssocResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询项目地点关联详情 */
export function getProjLocAssoc(id: string) {
  return http.get<ProjLocAssocDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增项目地点关联 */
export function addProjLocAssoc(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改项目地点关联 */
export function updateProjLocAssoc(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除项目地点关联 */
export function deleteProjLocAssoc(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出项目地点关联 */
export function exportProjLocAssoc(query: ProjLocAssocQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
