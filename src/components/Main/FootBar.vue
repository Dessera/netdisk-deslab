<template>
  <el-row type="flex" align="middle" justify="end">
    <el-button size="mini" @click="new_folder">新建文件夹</el-button>
    <el-button size="mini" @click="upload_start_point">上传</el-button>
    <el-dialog title="上传" :visible.sync="upload_state">
      <SubmitDialog></SubmitDialog>
    </el-dialog>
  </el-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import path from 'path-browserify'
import SubmitDialog from '@/components/Main/SubmitDialog.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'FootBar',
  components: { SubmitDialog },
  computed: {
    ...mapState('options', ['client']),
    ...mapState('files', ['file_dir']),
    ...mapGetters('options', ['oss_client'])
  },
  data () {
    return {
      upload_state: false
    }
  },
  methods: {
    upload_start_point () {
      this.upload_state = true
    },
    async new_folder () {
      try {
        const result = await this.$prompt('请输入文件夹名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/,
          inputErrorMessage: '文件夹名不能为空'
        })
        // 路径准备
        const oss_path = path.join(...this.file_dir, result.value) + '/'
        // 新建
        await this.oss_client.put(oss_path, Buffer.alloc(0, ''))
        await this.$store.dispatch('files/update_list', this.client)
      } catch (e) {
        // 错误处理
        if (e !== 'cancel') {
          this.$message({
            type: 'error',
            message: `创建失败:${e}`
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.el-row {
  height: 100%;
}
</style>
