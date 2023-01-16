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
      @click.stop="deletef">
      删除
    </el-button>
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapState } from 'vuex'
import path from 'path-browserify'

export default {
  name: 'SingleFile',
  props: ['file_attr'],
  methods: {
    async deepen () {
      if (this.file_attr.ext === '/') this.$store.commit('files/UPDATE_PTR', this.file_attr.name)
    },
    async deletef () {
      const notify = (err) => {
        if (err) {
          this.$notify({
            type: 'error',
            title: '删除失败',
            message: err
          })
        } else {
          this.$notify({
            type: 'success',
            title: '删除成功'
          })
        }
      }
      const origin = path.join(this.file_attr.dir, this.file_attr.base)
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.file_attr.ext === '/') {
          this.$bus.$emit('oss_delete_dir', this.client, origin, notify)
        } else {
          this.$bus.$emit('oss_delete_file', this.client, origin, notify)
        }
      }).catch(() => {
      })
    },
    async download () {
      // 准备路径等数据
      const origin = path.join(this.file_attr.dir, this.file_attr.base)
      const target = remote.dialog.showSaveDialogSync({
        defaultPath: this.file_attr.base
      })
      if (!target) return false
      // 触发下载事件,并接受下载进度
      this.download_flag = true
      this.$bus.$emit('oss_download', this.client, origin, target, (percentage) => {
        // 如果返回是数字,则正常处理,如果返回是错误,进行错误处理
        this.download_percentage = percentage
        if (percentage === 100) {
          this.$notify({
            title: '下载成功',
            type: 'success'
          })
          setTimeout(() => {
            this.download_flag = false
            this.download_percentage = 0
          }, 500)
        } else if (typeof percentage !== 'number') {
          this.download_flag = false
          this.download_percentage = 0
          this.$notify.error({
            title: '下载失败',
            message: percentage
          })
        }
      })
    },
    async get_link () {
      const origin = path.join(this.file_attr.dir, this.file_attr.base)
      this.$bus.$emit('oss_link', this.client, origin, (url) => {
        this.$alert(url, '已生成链接', {
          confirmButtonText: '复制',
          callback: () => {
            remote.clipboard.writeText(url)
            this.$notify({
              title: '已复制到剪贴板',
              type: 'success'
            })
          }
        })
      })
    },
    get_preview () {
      const origin = path.join(this.file_attr.dir, this.file_attr.base)
      this.$bus.$emit('oss_image', this.client, origin, (url) => {
        this.$alert(`<img src="${url}">`, this.file_attr.base, {
          dangerouslyUseHTMLString: true
        })
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
    ...mapState('user_data', ['client']),
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
