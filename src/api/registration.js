import request from '../utils/request'

// 获取报名列表（分页）
export const getRegistrationPage = (params) => {
  return request({
    url: '/registration/page',
    method: 'get',
    params
  })
}

// 新增报名
export const addRegistration = (data) => {
  return request({
    url: '/registration',
    method: 'post',
    data
  })
}

// 取消报名
export const cancelRegistration = (id) => {
  return request({
    url: `/registration/cancel/${id}`,
    method: 'put'
  })
}

// 确认报名
export const confirmRegistration = (id) => {
  return request({
    url: `/registration/confirm/${id}`,
    method: 'put'
  })
}

// 删除报名
export const deleteRegistration = (id) => {
  return request({
    url: `/registration/${id}`,
    method: 'delete'
  })
}

// 获取学生报名情况
export const getStudentRegistrations = (studentId, params) => {
  return request({
    url: `/registration/student/${studentId}`,
    method: 'get',
    params
  })
}

// 获取学生报名列表（带项目信息）
export const getStudentRegistrationList = (studentId) => {
  return request({
    url: `/registration/student/${studentId}/list`,
    method: 'get'
  })
}

// 获取项目报名情况
export const getProjectRegistrations = (projectId, params) => {
  return request({
    url: `/registration/project/${projectId}`,
    method: 'get',
    params
  })
}