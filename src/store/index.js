import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line camelcase
import user_data from '@/store/user_data'
import files from '@/store/files'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user_data, files
  }
})
