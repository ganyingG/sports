import request from '../utils/request'

export const getStudentPage = (params) => {
  return request({
    url: '/students/page',
    method: 'get',
    params
  })
}

export const getStudentById = (id) => {
  return request({
    url: `/students/${id}`,
    method: 'get'
  })
}

export const addStudent = (data) => {
  return request({
    url: '/students',
    method: 'post',
    data
  })
}

export const updateStudent = (data) => {
  return request({
    url: '/students',
    method: 'put',
    data
  })
}

export const deleteStudent = (id) => {
  return request({
    url: `/students/${id}`,
    method: 'delete'
  })
}