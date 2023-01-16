<template>
  <el-row type="flex" align="middle" justify="end">
    <el-button size="mini" @click="new_folder">新建文件夹</el-button>
    <el-button size="mini" @click="upload">上传</el-button>
  </el-row>
</template>

<script>
import { mapState } from 'vuex'
import { remote } from 'electron'
import path from 'path-browserify'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'FootBar',
  computed: {
    ...mapState('user_data', ['client']),
    ...mapState('files', ['file_dir'])
  },
  methods: {
    upload () {
      const local_path = remote.dialog.showOpenDialogSync({})
      if (local_path) {
        console.log(local_path)
        const base = path.parse(local_path[0]).base
        const oss_path = path.join(this.file_dir.join('/'), base)
        this.$bus.$emit('oss_upload', this.client, oss_path, local_path[0], (err) => {
          if (err) {
            this.$notify.error({
              title: '上传失败',
              message: err
            })
          } else {
            this.$notify({
              title: '上传成功',
              type: 'success'
            })
          }
        })
      }
    },
    new_folder () {
      this.$prompt('请输入文件夹名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
        inputErrorMessage: '文件夹名不能为空'
      }).then(({ value }) => {
        const oss_path = path.join(this.file_dir.join('/'), value)
        this.$bus.$emit('oss_new_folder', this.client, oss_path, (err) => {
          if (err) {
            this.$notify.error({
              title: '创建失败',
              message: err
            })
          } else {
            this.$notify({
              title: '创建成功',
              type: 'success'
            })
          }
        })
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>
.el-row {
  height: 100%;
}
</style>
