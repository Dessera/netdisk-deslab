<template>
  <div class="login_page">
    <Login></Login>
  </div>
</template>

<script>
import Login from '@/components/Login.vue'

export default {
  name: 'LoginPage',
  components: { Login }
}
</script>

<style scoped>
.login_page{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>
