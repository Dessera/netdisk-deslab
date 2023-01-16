<template>
  <div class="login">
    <el-row type="flex" justify="center" align="center">
      <i class="el-icon-sunset" @selectstart.prevent></i>
      <p @selectstart.prevent>NetDist 2.0</p>
    </el-row>
    <el-row type="flex" justify="center">
      <el-input placeholder="请输入用户名" v-model="user_data.name"></el-input>
    </el-row>
    <el-row type="flex" justify="center">
      <el-input placeholder="请输入密码" v-model="user_data.password" show-password></el-input>
    </el-row>
    <el-row type="flex" justify="center">
      <el-button type="primary" @click="login_generator">登录</el-button>
      <el-button>注册</el-button>
    </el-row>
  </div>
</template>

<script>

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Login',
  data () {
    return {
      user_data: {
        name: '',
        password: ''
      }
    }
  },
  methods: {
    async login_generator () {
      await this.$store.dispatch('user_data/login', this.user_data).then((data) => {
        this.$notify({
          title: '登录成功',
          message: '即将跳转至主页面',
          type: 'success'
        })
        this.$store.commit('files/UPDATE_LIST', data.objects)
        this.$store.commit('files/UPDATE_DIR', [])
        this.$router.push('/home')
      }).catch((err) => {
        this.$alert(err, '登录失败', {
          confirmButtonText: '确定'
        })
      })
    }
  }
}
</script>

<style scoped>
.login {
  width: 40%;
  height: 55%;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.login i {
  margin-right: 10px;
  font-size: 30px;
  line-height: 30px;
  color: #409eff;
}

.login p {
  cursor: default;
  line-height: 30px;
  font-size: 25px;
  color: #409eff;
}

.el-input {
  width: 80%;
}
</style>
