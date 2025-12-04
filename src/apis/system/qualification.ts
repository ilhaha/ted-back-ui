import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/invigilate/userQualification'
/** @desc 查询资格列表 */
export const getQualificationList = (params: { userId: number; page: number; pageSize: number }) => {
  return http.get(`${BASE_URL}/list/${params.userId}`);
};
/** @desc 新增资格 */
export const addQualification = (params: {
  userId: number;
  categoryId: number;
  qualificationUrl: string;
}) => {
    return http.post(`${BASE_URL}/addQualification`, params);
};
/** @desc 删除资格 */
export const deleteQualification = (id: number) => {
  return http.del(`${BASE_URL}/${id}`);
};