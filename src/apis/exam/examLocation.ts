import http from '@/utils/http'

const BASE_URL = '/exam/examLocation'

export interface ExamLocationResp {
  id: string
  locationName: string
  provinceId: string
  cityId: string
  streetId: string
  detailedAddress: string
  operationalStatus: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
  examLoacationId: number
  classroomId: number
}
export interface ExamLocationDetailResp {
  id: string
  locationName: string
  provinceName: string
  cityName: string
  streetId: string
  streetName: string
  detailedAddress: string
  operationalStatus: string
  redeme: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  examLoacationId: number
  classroomId: number
}
export interface ExamLocationQuery {
  locationName: string
  operationalStatus: string
  sort: Array<string>
}

export interface PlanLocationAndRoomVO {
  locationId: string
  locationName: string
  fullAddress: string
  classrommId: string
  classroomName: string
  maxCandidates: number
}

export interface ExamLocationPageQuery extends ExamLocationQuery, PageQuery {}

/** @desc 查询考试地点列表 */
export function listExamLocation(query: ExamLocationPageQuery) {
  const data = http.get<PageRes<ExamLocationResp[]>>(`${BASE_URL}`, query)
  data.then((res) => {
    const items = res.data.list
    items.forEach((item) => {
      switch (item.operationalStatus) {
        case 0: item.operationalStatus = '运营'; break
        case 1: item.operationalStatus = '休息'; break
        case 2: item.operationalStatus = '维护'; break
        case 3: item.operationalStatus = '关闭'; break
      }
    })
    // items.forEach((item) => {
    //   console.log(item)
    // }
  })
  return data
}

/** @desc 根据计划id获取计划对应的考试地点和考场信息 */
export function getPlanLocationAndRoomByPlanId(planId: string) {
  return http.get<PlanLocationAndRoomVO[]>(`${BASE_URL}/room/${planId}`)
}


/** @desc 查询考试地点详情 */
export function getExamLocation(id: string) {
  return http.get<ExamLocationDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增考试地点 */
export function addExamLocation(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改考试地点 */
export function updateExamLocation(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除考试地点 */
export function deleteExamLocation(ids: string) {
  return http.del(`${BASE_URL}/${ids}`)
}

/** @desc 导出考试地点 */
export function exportExamLocation(query: ExamLocationQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
