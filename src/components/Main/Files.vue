<template>
  <div class="files">
    <el-empty v-show="current_list.length === 0" description="还没有任何文件"></el-empty>
    <SingleFile v-for="(item,index) in current_list" :key="index" :file_attr="item"></SingleFile>
  </div>
</template>

<script>
import SingleFile from '@/components/Main/SingleFile.vue'
import { mapGetters } from 'vuex'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Files',
  components: { SingleFile },
  computed: {
    ...mapGetters('files', ['current_list'])
  }
}
</script>

<style scoped>
.files {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
