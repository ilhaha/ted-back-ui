import http from '@/utils/http'

const BASE_URL = '/examconnect/knowledgeType'

export interface KnowledgeTypeResp {
  id: string
  projectId: string
  projectName: string
  name: string
  proportion: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface KnowledgeTypeDetailResp {
  id: string
  projectId: string
  name: string
  proportion: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface KnowledgeTypeQuery {
  projectName?: string
  createUserName?: string
  updateUserName?: string
  sort: Array<string>
}
export interface KnowledgeTypePageQuery extends KnowledgeTypeQuery, PageQuery {}

/** @desc 查询知识类型，存储不同类型的知识占比列表 */
export function listKnowledgeType(query: KnowledgeTypePageQuery) {
  return http.get<PageRes<KnowledgeTypeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询知识类型，存储不同类型的知识占比详情 */
export function getKnowledgeType(id: string) {
  return http.get<KnowledgeTypeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增知识类型，存储不同类型的知识占比 */
export function addKnowledgeType(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改知识类型，存储不同类型的知识占比 */
export function updateKnowledgeType(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除知识类型，存储不同类型的知识占比 */
export function deleteKnowledgeType(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出知识类型，存储不同类型的知识占比 */
export function exportKnowledgeType(query: KnowledgeTypeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
