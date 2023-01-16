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

async function handleDel (name, client) {
  try {
    await client.delete(name)
  } catch (error) {
    error.failObjectName = name
    return error
  }
}

Vue.prototype.$bus.$on('oss_link', async (user_data, origin, callback) => {
  const response = {
    'content-disposition': `attachment; filename=${encodeURIComponent(origin)}`
  }
  const url = createClient(user_data).signatureUrl(origin, { response })
  callback(url)
})
Vue.prototype.$bus.$on('oss_image', async (user_data, origin, callback) => {
  const url = createClient(user_data).signatureUrl(origin, {
    expires: 600,
    // eslint-disable-next-line quote-props
    'process': 'image/resize,w_300'
  })
  callback(url)
})

Vue.prototype.$bus.$on('oss_download', async (user_data, original, target, callback) => {
  try {
    const response = {
      'content-disposition': `attachment; filename=${encodeURIComponent(original)}`
    }
    const url = createClient(user_data).signatureUrl(original, { response })
    axios.get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress (progressEvent) {
        const process = (progressEvent.loaded / progressEvent.total * 100 | 0)
        callback(process)
      }
    }).then((result) => {
      fs.writeFileSync(target, Buffer.from(result.data), 'binary')
    }).catch(err => callback(err))
  } catch (err) {
    callback(err)
  }
})

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

Vue.prototype.$bus.$on('oss_delete_file', async function (user_data, oss_path, callback) {
  const client = createClient(user_data)
  client.delete(oss_path).then(() => {
    this.$store.dispatch('files/update_list', user_data).then(() => callback(null)).catch(err => callback(err))
  }).catch(err => callback(err))
})

Vue.prototype.$bus.$on('oss_delete_dir', async function (user_data, oss_path, callback) {
  try {
    const client = createClient(user_data)
    const list = await client.list({
      prefix: oss_path.slice(-1) === '/' ? oss_path : oss_path + '/'
    })
    list.objects = list.objects || []
    Promise.all(list.objects.map((v) => handleDel(v.name, client))).then(() => {
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
