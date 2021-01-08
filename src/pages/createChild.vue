<template>
  <div class="article-page">
    <div class="title">创建子应用</div>
    <h4>1.全局安装 daodao-qiankun-cli，如果刚刚安装过了就不用再次安装了</h4>
    <pre v-highlightjs><code class="javascript">
      npm install daodao-qiankun-cli -g
    </code></pre>
    <h4>2.安装成功后创建子应用</h4>
    <pre v-highlightjs><code class="javascript">
      daodao init childApp
    </code></pre>
    <p>
      自定义一些信息后，模板选择 child, 等待模板下载完毕子应用就创建成功了
    </p>
    <h4>3.启动子应用</h4>
    <pre v-highlightjs><code class="javascript">
      cd childApp
      npm install
      npm run dev
    </code></pre>
    <p>
      然后打开主应用刷新，就能看到子应用的页面
    </p>
  </div>
</template>

<script>
export default {
  name: 'List',
  data(){
    return {
      
    }
  },
  mounted(){
    
  },
  methods: {
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello{
  width:800px;
}
</style>
