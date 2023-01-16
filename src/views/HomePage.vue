<template>
  <el-container>
    <el-aside width="20%">
      <el-menu
        default-active="Files"
        class="el-menu-vertical-demo"
        @select="switch_main"
      >
        <el-menu-item :index="'Files'">
          <i class="el-icon-folder"></i>
          <span slot="title">文件</span>
        </el-menu-item>
        <el-menu-item :index="'Setting'">
          <i class="el-icon-setting"></i>
          <span slot="title">设置</span>
        </el-menu-item>
        <el-menu-item :index="'About'">
          <i class="el-icon-sunset"></i>
          <span slot="title">关于</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="30px">
        <Dirs></Dirs>
      </el-header>
      <el-main>
        <keep-alive include="Files">
          <router-view></router-view>
        </keep-alive>
      </el-main>
      <el-footer height="40px">
        <FootBar></FootBar>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
import Dirs from '@/components/Main/Dirs.vue'
import FootBar from '@/components/Main/FootBar.vue'

export default {
  name: 'HomePage',
  components: { FootBar, Dirs },
  methods: {
    switch_main (index, index_path) {
      this.$router.push({
        name: index
      }).catch(() => {
      })
    }
  }
}
</script>

<style scoped>
.el-aside {
  border: 1px solid #eee;
}
.el-footer, .el-header{
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}
.el-container {
  height: 100%;
}
</style>
