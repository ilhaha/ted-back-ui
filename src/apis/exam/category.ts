import http from '@/utils/http'
import type {LabelValueState} from "@/types/global";

const BASE_URL = '/exam/category'
const SELECT_OPTIONS = `${BASE_URL}/selectOptions`

export interface CategoryResp {
  id: string
  name: string
  parentId: string
  code: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  topicNumber: number
  videoUrl: string
}
export interface CategoryDetailResp {
  id: string
  name: string
  parentId: string
  code: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  topicNumber: number
  videoUrl: string
}
export interface CategoryQuery {
  name: string | undefined
  sort: Array<string>
}
export interface CategoryPageQuery extends CategoryQuery, PageQuery {}


export function selectOptions() {
  return http.get(`${SELECT_OPTIONS}`)
}

/** @desc 查询八大类，存储题目分类信息列表 */
export function listCategory(query: CategoryPageQuery) {
  return http.get<PageRes<CategoryResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询八大类，存储题目分类信息详情 */
export function getCategory(id: string) {
  return http.get<CategoryDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增八大类，存储题目分类信息 */
export function addCategory(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改八大类，存储题目分类信息 */
export function updateCategory(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除八大类，存储题目分类信息 */
export function deleteCategory(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出八大类，存储题目分类信息 */
export function exportCategory(query: CategoryQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

export function getAllPath(id: number) {
  return http.get(`${BASE_URL}/getAllPath/${id}`)
}

export function verifyExcel(file: any) {
  return http.post(`${BASE_URL}/verifyExcel`, file)
}

