import http from '@/utils/http'

const BASE_URL = '/exam/trainingFeeNotice'

export interface TrainingFeeNoticeResp {
  id: string
  noticeId: string
  paymentOrderNo: string
  totalPersonItemCount: string
  totalAmount: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface TrainingFeeNoticeDetailResp {
  id: string
  noticeId: string
  paymentOrderNo: string
  totalPersonItemCount: string
  totalAmount: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface TrainingFeeNoticeQuery {
  paymentOrderNo: string | undefined
  noticeId: string | undefined
  sort: Array<string>
}
export interface TrainingFeeNoticePageQuery extends TrainingFeeNoticeQuery, PageQuery {}

/** @desc 查询培训收费通知单列表 */
export function listTrainingFeeNotice(query: TrainingFeeNoticePageQuery) {
  return http.get<PageRes<TrainingFeeNoticeResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询培训收费通知单详情 */
export function getTrainingFeeNotice(id: string) {
  return http.get<TrainingFeeNoticeDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增培训收费通知单 */
export function addTrainingFeeNotice(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改培训收费通知单 */
export function updateTrainingFeeNotice(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除培训收费通知单 */
export function deleteTrainingFeeNotice(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出培训收费通知单 */
export function exportTrainingFeeNotice(query: TrainingFeeNoticeQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
