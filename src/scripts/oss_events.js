import Vue from 'vue'
import OSS from 'ali-oss'
import fs from 'fs'
// import path from 'path'
import axios from 'axios'

// const OSS = require('ali-oss')

function createClient (user_data) {
  return new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: user_data.name,
    accessKeySecret: user_data.password,
    bucket: 'deslab-testbucket'
  })
}

Vue.prototype.$bus.$on('oss_upload', async function (user_data, oss_path, local_path, callback) {
  try {
    const stream = fs.createReadStream(local_path)
    createClient(user_data).putStream(oss_path, stream).then(() => {
      this.$store.dispatch('files/update_list', user_data).then(() => callback(null)).catch(err => callback(err))
    }).catch(err => callback(err))
  } catch (err) {
    callback(err)
  }
})

Vue.prototype.$bus.$on('oss_new_folder', async function (user_data, oss_path, callback) {
  const client = createClient(user_data)
  client.put(`${oss_path}/`, Buffer.alloc(0, '')).then(() => {
    this.$store.dispatch('files/update_list', user_data).then(() => callback(null)).catch(err => callback(err))
  }).catch(err => callback(err))
})
