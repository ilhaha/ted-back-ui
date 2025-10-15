import http from '@/utils/http'

const BASE_URL = '/common/carousel'

export interface CarouselResp {
  id: string
  imageUrl: string
  linkUrl: string
  description: string
  sortOrder: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CarouselDetailResp {
  id: string
  imageUrl: string
  linkUrl: string
  description: string
  sortOrder: string
  status: string
  createUser: string
  updateUser: string
  createTime: string
  updateTime: string
  isDeleted: string
  createUserString: string
  updateUserString: string
}
export interface CarouselQuery {
  status: string | undefined
  sort: Array<string>
}
export interface CarouselPageQuery extends CarouselQuery, PageQuery {}

/** @desc 查询轮播图管理列表 */
export function listCarousel(query: CarouselPageQuery) {
  return http.get<PageRes<CarouselResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询轮播图管理详情 */
export function getCarousel(id: string) {
  return http.get<CarouselDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增轮播图管理 */
export function addCarousel(data: any) {
  return http.post(`${BASE_URL}`, data)
}

/** @desc 修改轮播图管理 */
export function updateCarousel(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除轮播图管理 */
export function deleteCarousel(id: string) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 导出轮播图管理 */
export function exportCarousel(query: CarouselQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 上传文件 */
export function uploadImage(data: FormData) {
  return http.post(`common/file`, data)
}

/** @desc 上传文件 */
export function upload(data: FormData) {
  return http.post(`/upload/file`, data)
}
