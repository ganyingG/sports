import request from '../utils/request'

export const getProjectPage = (params) => {
  return request({
    url: '/projects/page',
    method: 'get',
    params
  })
}

export const getProjectById = (id) => {
  return request({
    url: `/projects/${id}`,
    method: 'get'
  })
}

export const addProject = (data) => {
  return request({
    url: '/projects',
    method: 'post',
    data
  })
}

export const updateProject = (data) => {
  return request({
    url: '/projects',
    method: 'put',
    data
  })
}

export const deleteProject = (id) => {
  return request({
    url: `/projects/${id}`,
    method: 'delete'
  })
}