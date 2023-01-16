import path from 'path-browserify'
import OSS from 'ali-oss'

function createClient (user_data) {
  return new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: user_data.name,
    accessKeySecret: user_data.password,
    bucket: 'deslab-testbucket'
  })
}

export default {
  namespaced: true,
  state: {
    file_dir: [],
    file_list: []
  },
  getters: {
    current_list (state) {
      // eslint-disable-next-line prefer-const
      let res = []
      const dir_str = state.file_dir.join('/')
      state.file_list.forEach((item) => {
        const data = path.parse(item.name)
        if (item.name.slice(-1) === '/') data.ext = '/'
        if (data.dir === dir_str) {
          res.push(data)
        }
      })
      return res.sort((_, sec) => {
        return sec.ext === '/' ? 1 : -1
      })
    }
  },
  mutations: {
    UPDATE_PTR (state, dirname) {
      state.file_dir.push(dirname)
    },
    POP_PTR (state) {
      state.file_dir.pop()
    },
    UPDATE_LIST (state, list) {
      state.file_list = list
    },
    UPDATE_DIR (state, dir) {
      state.file_dir = dir
    }
  },
  actions: {
    update_list (context, user_data) {
      return new Promise((resolve, reject) => {
        createClient(user_data).list().then((res) => {
          context.commit('UPDATE_LIST', res.objects)
          resolve(res.objects)
        }).catch((err) => reject(err))
      })
    }
  }
}
