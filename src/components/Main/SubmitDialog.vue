<template>
  <div class="submit">
    <el-button style="margin: 10px;" size="small" type="success" @click="submit_upload">上传到服务器</el-button>
    <el-upload
      class=""
      action=""
      ref="upload"
      :file-list="file_list"
      :http-request="upload"
      :auto-upload="false"
      multiple
      drag
      :limit="5">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import path from 'path-browserify'
import axios from 'axios'

export default {
  name: 'SubmitDialog',
  computed: {
    ...mapState('options', ['client']),
    ...mapState('files', ['file_dir']),
    ...mapGetters('options', ['oss_client'])
  },
  data () {
    return {
      file_list: []
    }
  },
  methods: {
    submit_upload () {
      this.$refs.upload.submit()
    },
    async upload (e) {
      try {
        // 路径准备
        const filename = path.basename(e.file.path)
        const oss_path = path.join(...this.file_dir, filename)
        // 获取签名并上传
        const url = this.oss_client.signatureUrl(oss_path, {
          expires: 3600,
          method: 'PUT',
          'Content-Type': 'application/octet-stream'
        })
        await axios.put(url, e.file, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
          },
          onUploadProgress: function (progressEvent) {
            if (progressEvent.loaded !== progressEvent.total) {
              e.onProgress({ percent: progressEvent.loaded / progressEvent.total * 100 })
            }
          }
        })
        await this.$store.dispatch('files/update_list', this.client)
        this.file_list.push({
          name: filename,
          url
        })
      } catch (err) {
        // 错误处理
        this.$message({
          type: 'error',
          message: `上传失败:${err}`
        })
      }
    }
  }
}
</script>
