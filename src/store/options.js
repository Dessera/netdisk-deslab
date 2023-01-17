/*
 * user_data 模块，用来存储账户信息，以及和OSS进行交互
 * */

// import fs from 'fs'

const OSS = require('ali-oss')
export default {
  namespaced: true,
  actions: {
    // 登录
    login (context, user_data) {
      return new Promise((resolve, reject) => {
        const client = new OSS({
          region: 'oss-cn-hangzhou',
          accessKeyId: user_data.name,
          accessKeySecret: user_data.password,
          bucket: 'deslab-testbucket'
        })
        client.list().then((res) => {
          context.commit('LOGIN', user_data)
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
      })
    }
  },
  mutations: {
    LOGIN (state, client) {
      state.client = client
    }
  },
  state: {
    client: null
  },
  getters: {}
}
