<template>
  <div class="file" @click="deepen">
    <i :class="icon"></i>
    <p>{{ file_attr.name }}{{ extname }}</p>
    <el-progress
      :text-inside="true"
      v-show="download_flag"
      :stroke-width="26"
      :percentage="download_percentage"></el-progress>
    <el-button
      v-if="installable && !download_flag"
      size="mini"
      type="primary"
      icon="el-icon-download"
      round
      @click.stop="download">
      下载
    </el-button>
    <el-button
      v-if="installable && !download_flag"
      size="mini"
      type="primary"
      icon="el-icon-download"
      round
      @click.stop="get_link">
      获取外链
    </el-button>
    <el-button
      v-if="is_image"
      size="mini"
      type="primary"
      icon="el-icon-zoom-in"
      round
      @click.stop="get_preview">
      预览
    </el-button>
    <el-button
      v-if="!download_flag"
      size="mini"
      type="danger"
      icon="el-icon-close"
      round
      @click.stop="delete_file">
      删除
    </el-button>
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapGetters, mapState } from 'vuex'
import path from 'path-browserify'
import axios from 'axios'
import fs from 'fs'

export default {
  name: 'SingleFile',
  props: ['file_attr'],
  methods: {
    async deepen () {
      if (this.file_attr.ext === '/') this.$store.commit('files/UPDATE_PTR', this.file_attr.name)
    },
    // 删除事件处理
    async delete_file () {
      try {
        // 删除确认
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 获取路径
        const origin = path.join(this.file_attr.dir, this.file_attr.base)
        let del_list = []
        if (this.file_attr.ext === '/') {
          del_list = (await this.oss_client.list({
            prefix: `${origin}/`
          })).objects.map((item) => {
            return item.name
          })
        } else {
          del_list.push(origin)
        }
        // 向OSS请求删除
        await Promise.all(del_list.map((object) => this.oss_client.delete(object)))
        // 更新列表
        await this.$store.dispatch('files/update_list', this.client)
        this.$message({
          type: 'success',
          message: '删除成功'
        })
      } catch (e) {
        // 错误处理
        this.$message({
          type: 'error',
          message: `删除失败:${e}`
        })
      }
    },
    async download () {
      try {
        // 准备路径等数据
        const origin = path.join(this.file_attr.dir, this.file_attr.base)
        const target = remote.dialog.showSaveDialogSync({
          defaultPath: this.file_attr.base
        })
        if (target) {
          // 触发下载事件,并接受下载进度
          this.download_flag = true
          // 获取url
          const response = {
            'content-disposition': `attachment; filename=${encodeURIComponent(origin)}`
          }
          const url = this.oss_client.signatureUrl(origin, { response })
          // 获取文件内容
          const result = await axios.get(url, {
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
              this.download_percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
            }
          })
          fs.writeFileSync(target, Buffer.from(result.data), 'binary')
          this.$message({
            type: 'success',
            message: '下载成功'
          })
          setTimeout(() => {
            this.download_flag = false
            this.download_percentage = 0
          }, 1000)
        }
      } catch (e) {
        // 错误处理
        this.$message({
          type: 'error',
          message: `下载失败:${e}`
        })
      }
    },
    async get_link () {
      try {
        // 获取url
        const origin = path.join(this.file_attr.dir, this.file_attr.base)
        const response = {
          'content-disposition': `attachment; filename=${encodeURIComponent(origin)}`
        }
        const url = this.oss_client.signatureUrl(origin, { response })
        // 显示并复制
        await this.$alert(url, '已生成链接', {
          confirmButtonText: '复制',
          callback: () => {
            remote.clipboard.writeText(url)
            this.$notify({
              title: '已复制到剪贴板',
              type: 'success'
            })
          }
        })
      } catch (e) {
        // 错误处理
        this.$message({
          type: 'error',
          message: `获取链接失败:${e}`
        })
      }
    },
    get_preview () {
      // 获取链接
      const origin = path.join(this.file_attr.dir, this.file_attr.base)
      const url = this.oss_client.signatureUrl(origin, {
        expires: 600,
        process: 'image/resize,w_300'
      })
      // 显示
      this.$alert(`<img src="${url}" alt="${url}">`, this.file_attr.base, {
        dangerouslyUseHTMLString: true
      })
    }
  },
  data () {
    return {
      download_flag: false,
      download_percentage: 0
    }
  },
  computed: {
    ...mapState('options', ['client']),
    ...mapGetters('options', ['oss_client']),
    installable () {
      return this.file_attr.ext !== '/'
    },
    extname () {
      if (this.file_attr.ext === '/') {
        return ''
      } else {
        return this.file_attr.ext
      }
    },
    icon () {
      switch (this.file_attr.ext) {
        case '/':
          return 'el-icon-folder-opened'
        case '.jpeg':
        case '.gif':
        case '.png':
        case '.jpg':
          return 'el-icon-picture-outline'
        case '.mp4':
          return 'el-icon-film'
        case '.mp3':
          return 'el-icon-headset'
        case '.txt':
          return 'el-icon-document'
        case '.zip':
          return 'el-icon-s-management'
        default:
          return 'el-icon-document-delete'
      }
    },
    is_image () {
      return this.file_attr.ext === '.jpg' || this.file_attr.ext === '.jpeg' ||
        this.file_attr.ext === '.gif' || this.file_attr.ext === '.png' ||
        this.file_attr.ext === '.webp'
    }
  }
}
</script>

<style scoped>
.file {
  width: 90%;
  height: 50px;
  margin-bottom: 10px;
  border: 1px solid #d7dae2;
  border-radius: 2px;
  display: flex;
  cursor: default;
  justify-content: space-evenly;
  align-items: center;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.file:hover {
  color: #409eff;
}

.file:hover .el-button {
  display: block;
}

i {
  font-size: 25px;
  line-height: 50px;
  margin: 0 10px;
}

p {
  font-size: 14px;
  line-height: 50px;
  flex-grow: 1;
}

.el-button {
  display: none;
  margin: 0 10px;
}

.el-progress {
  width: 100px;
  margin: 0 10px;
}
</style>
