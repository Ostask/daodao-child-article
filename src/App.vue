<template>
  <div id="app">
    <!-- {{number}} -->
    <router-view></router-view>
  </div>
</template>

<script>
import {getToken} from "@/utils/auth"
import {watchUserInfo} from "@/utils/actions";

export default {
  name: 'App',
  data(){
    return{                     
      number:0
    }
  },           
  mounted() {
    
  },
}
</script>

<style scoped>

</style>
