import request from '../utils/request'

export const getRefereePage = (params) => {
  return request({
    url: '/referees/page',
    method: 'get',
    params
  })
}

export const getRefereeById = (id) => {
  return request({
    url: `/referees/${id}`,
    method: 'get'
  })
}

export const addReferee = (data) => {
  return request({
    url: '/referees',
    method: 'post',
    data
  })
}

export const updateReferee = (data) => {
  return request({
    url: '/referees',
    method: 'put',
    data
  })
}

export const deleteReferee = (id) => {
  return request({
    url: `/referees/${id}`,
    method: 'delete'
  })
}