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
  payNoticeUrl: string
  payProofUrl: string
  payStatus: number
  candidateCount: number
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
  payNoticeUrl: string
  payProofUrl: string
  payStatus: number
  candidateCount: number
}
export interface OrgClassQuery {
  className: string | undefined
  classId: string | undefined
  isOrgQuery: boolean
  flag: number
}

export interface OrgClassPageQuery extends OrgClassQuery, PageQuery { }


/** @desc 缴费审核 */
export function reviewPayment(data: any) {
  return http.post(`${BASE_URL}/review/pay/proof`, data)
}


/**
 * 根据项目类型和班级类型获取班级选择器
 * @param id 
 * @returns 
 */
export function getSelectClassByProject(projectId: string, classType: number) {
  return http.get<any[]>(`${BASE_URL}/select/${projectId}/${classType}/0`)
}

/** @desc 根据班级展示班级缴费信息 */
export function listOrgClassPayAudit(query: OrgClassPageQuery) {
  return http.get<PageRes<OrgClassResp[]>>(`${BASE_URL}/pay/audit/page`, query)
}


/** @desc 根据班级展示作业人员的报名信息 */
export function listOrgClassWorker(query: OrgClassPageQuery) {
  return http.get<PageRes<OrgClassResp[]>>(`${BASE_URL}/worker/page`, query)
}

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
