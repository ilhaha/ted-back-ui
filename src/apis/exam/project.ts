import http from '@/utils/http'

const BASE_URL = '/exam/project'
// 获取项目列表
const PROJECT_LOCATION_URL = `${BASE_URL}/location/select`
// 获取考试场地列表
const PROJECT_CLASSROOM_URL = `${BASE_URL}/classroom/select`
// 获取项目没有绑定地址的列表
const NOT_BINDING_LOCATION = `${BASE_URL}/location/notBinding`
// 获取项目没有绑定的资料列表
const NOT_BINDING_DOCUMENT = `${BASE_URL}/document/notBinding`
// 项目绑定资料
const BINDING_DOCUMENT = `${BASE_URL}/document`
// 获取项目已绑定的资料
const HAVE_BINDING_DOCUMENT = `${BASE_URL}/document`
// 绑定的地址
const BINDING_BOUND_LOCATION = `${BASE_URL}/location`
// 绑定地址
const BINDING_LOCATION = `${BASE_URL}/location`
// 解绑地址
const UNBINDING_LOCATION = `${BASE_URL}/location/`
// 解绑资料
const UNBINDING_DOCUMENT = `${BASE_URL}/document`
// 获取下拉框
const SELECT_OPTIONS = `${BASE_URL}/selectOptions`

export interface ProjectResp {
  id: string
  projectName: string
  projectCode: string
  examDuration: string
  deptName: string
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

export interface ProjectDetailResp {
  id: string
  projectName: string
  projectCode: string
  examDuration: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  categoryId: string
}

export interface ProjectSearchQuery {
  projectName: string
  projectCode: string
    createUser: string
}

export interface ProjectLocationList {
  id: string
  locationName: string
  province: string
  city: string
  street: string
  detailedAddress: string
  operationalStatus: string
}

export interface ProjectDocumentList {
  id: string
  typeName: string
}

export interface ProjectQuery {
  sort: Array<string>
}
export interface ProjectPageQuery extends ProjectQuery, PageQuery {}

/** @desc 查询项目列表 */
export function getProjectsWithClassrooms() {
  return http.get(`${BASE_URL}/with-classrooms`)
}

/** @desc 查询项目列表 */
export function listProject(query: ProjectPageQuery) {
  return http.get<PageRes<ProjectResp[]>>(`${BASE_URL}`, query)
}

export function selectOptions() {
  return http.get(`${SELECT_OPTIONS}`)
}

/** @desc 项目绑定的地址 */
export function bindingLocation(id: string, locationList?: string[]) {
  return http.get<PageRes<ProjectLocationList[]>>(`${BINDING_BOUND_LOCATION}/${id}`, locationList)
}

/** @desc 项目已绑定的资料 */
export function bindingDocumentListApi(id: string) {
  return http.get<PageRes<ProjectDocumentList[]>>(`${HAVE_BINDING_DOCUMENT}/${id}`)
}

/** @desc 项目绑定地址 */
export function bindingBindingLocation(id: string, locationList?: string[]) {
  return http.post(`${BINDING_LOCATION}/${id}`, locationList)
}

/** @desc 项目解绑地址 */
export function unBindingLocation(id: string, locationList?: string[]) {
  return http.del(`${UNBINDING_LOCATION}/${id}`, locationList)
}

/** @desc 项目解绑地址 */
export function unBindingDocument(id: string, locationList?: string[]) {
  return http.del(`${UNBINDING_DOCUMENT}/${id}`, locationList)
}

/** @desc 查询项目未绑定的地址 */
export function getNotBindingLocation(projectId: string) {
  return http.post(`${NOT_BINDING_LOCATION}/${projectId}`)
}

/** @desc 项目绑定资料 */
export function bindingBindingDocument(id: string, documentList?: string[]) {
  return http.post(`${BINDING_DOCUMENT}/${id}`, documentList)
}

/** @desc 查询项目未绑定的资料 */
export function getNotBindingDocument(projectId: string) {
  return http.post(`${NOT_BINDING_DOCUMENT}/${projectId}`)
}

/** @desc 查询项目未绑定的地址 */
export function getBindingLocation(projectId: string) {
  return http.post(`${NOT_BINDING_LOCATION}/${projectId}`)
}

/** @desc 查询项目包含地点的下拉框信息 */
export function getLocationSelect(projectId: string) {
  return http.get(`${PROJECT_LOCATION_URL}/${projectId}`)
}

/** @desc 获取地址包含考场的下拉框信息 */
export function getClassRoomSelect(projectId: string) {
  return http.get(`${PROJECT_CLASSROOM_URL}/${projectId}`)
}

/** @desc 查询项目详情 */
export function getProject(id: string) {
  return http.get<ProjectDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增项目 */
export function addProject(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改项目 */
export function updateProject(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除项目 */
export function deleteProject(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出项目 */
export function exportProject(query: ProjectQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 审核项目 */
export function examine(id: string, data: any) {
  return http.put(`${BASE_URL}/examine/${id}`, data)
}