<template>
  <div class="top_bar">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item,index) in file_dir" :key="index">{{ item }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button v-show="shallow_flag" type="text" icon="el-icon-arrow-left" @click="shallow">返回上一级</el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Dirs',
  computed: {
    ...mapState('files', ['file_dir']),
    shallow_flag () {
      return this.file_dir.length > 0
    }
  },
  methods: {
    shallow () {
      this.$store.commit('files/POP_PTR')
    }
  }
}
</script>

<style scoped>
.top_bar {
  height: 30px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.el-breadcrumb {
  height: 30px;
  line-height: 30px;
  cursor: default;
  flex-grow: 1;
}
</style>
