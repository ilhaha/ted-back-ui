import http from '@/utils/http'

const BASE_URL = '/training/training'

export interface TrainingResp {
  id: string
  title: string
  coverPath: string
  totalDuration: string
  expertId: string
  expertName: string
  fee: string
  description: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface TrainingDetailResp {
  id: string
  title: string
  coverPath: string
  totalDuration: string
  expertId: string
  expertName: string
  fee: string
  description: string
  status: string
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}

export interface TrainTreeReq {
  tedTrainingId: number
}

export interface TrainTreeReq {
  tedTrainingId: number
}

export interface TrainingQuery {
  title: string | undefined
  totalDuration: string | undefined
  expertName: string | undefined
  sort: Array<string>
}

export interface TrainingPageQuery extends TrainingQuery, PageQuery {}

/** @desc 查询培训主表列表 */
export function listTraining(query: TrainingPageQuery) {
  return http.get<PageRes<TrainingResp[]>>(`${BASE_URL}`, query)
}

/**
 * 查询培训内容
 * @param data
 * @returns
 */
export function trainingContent(data: TrainTreeReq) {
  return http.post(`${BASE_URL}/getTree`, data)
}

/** @desc 查询培训主表详情 */
export function getTraining(id: string) {
  return http.get<TrainingDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增培训主表 */
export function addTraining(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改培训主表 */
export function updateTraining(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除培训主表 */
export function deleteTraining(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出培训主表 */
export function exportTraining(query: TrainingQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 更新培训审核状态 */
export function updateTrainingStatus(id: string, status: string) {
  return http.post<boolean>(`${BASE_URL}/updateInvigilate`, null, {
    params: {
      id,
      status: status,
    },
  })
}
