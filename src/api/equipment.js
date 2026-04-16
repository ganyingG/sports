import request from '../utils/request'

export const getEquipmentPage = (params) => {
  return request({
    url: '/equipment/page',
    method: 'get',
    params
  })
}

export const getEquipmentById = (id) => {
  return request({
    url: `/equipment/${id}`,
    method: 'get'
  })
}

export const addEquipment = (data) => {
  return request({
    url: '/equipment',
    method: 'post',
    data
  })
}

export const updateEquipment = (data) => {
  return request({
    url: '/equipment',
    method: 'put',
    data
  })
}

export const deleteEquipment = (id) => {
  return request({
    url: `/equipment/${id}`,
    method: 'delete'
  })
}

export const getEquipmentProjects = (id) => {
  return request({
    url: `/equipment/${id}/projects`,
    method: 'get'
  })
}