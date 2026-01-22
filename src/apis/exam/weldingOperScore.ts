import http from '@/utils/http'

const BASE_URL = '/exam/weldingOperScore'

export interface WeldingOperScoreResp {
  id: string
  planId: string
  recordId: string
  candidateId: string
  projectCode: string
  operScore: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface WeldingOperScoreDetailResp {
  id: string
  planId: string
  recordId: string
  candidateId: string
  projectCode: string
  operScore: string
  isDeleted: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface WeldingOperScoreQuery {
  planId: string | undefined
  recordId: string | undefined
  candidateId: string | undefined
  projectCode: string | undefined
  sort: Array<string>
}
export interface WeldingOperScorePageQuery extends WeldingOperScoreQuery, PageQuery {}

/** @desc 查询焊接项目实操成绩列表 */
export function listWeldingOperScore(query: WeldingOperScorePageQuery) {
  return http.get<PageRes<WeldingOperScoreResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询焊接项目实操成绩详情 */
export function getWeldingOperScore(id: string) {
  return http.get<WeldingOperScoreDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增焊接项目实操成绩 */
export function addWeldingOperScore(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改焊接项目实操成绩 */
export function updateWeldingOperScore(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除焊接项目实操成绩 */
export function deleteWeldingOperScore(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出焊接项目实操成绩 */
export function exportWeldingOperScore(query: WeldingOperScoreQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
