import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line camelcase
import options from '@/store/options'
import files from '@/store/files'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    options, files
  }
})
