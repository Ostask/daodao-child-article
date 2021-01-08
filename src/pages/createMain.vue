<template>
  <div class="article-page">
    <div class="title">创建主应用</div>
    <h4>1.全局安装 daodao-qiankun-cli</h4>
    <pre v-highlightjs><code class="javascript">
      npm install daodao-qiankun-cli -g
    </code></pre>
    <h4>2.安装成功后创建主应用</h4>
      <pre v-highlightjs><code class="javascript">
        daodao init mainApp
      </code></pre>
    <p>
      自定义一些信息后，模板选择 main, 等待模板下载完毕主应用就创建成功了
    </p>
    <h4>3.启动主应用</h4>
    <pre v-highlightjs><code class="javascript">
      cd mainApp
      npm install
      npm run dev
    </code></pre>
    <p>
      然后再创建子应用，启动子应用
    </p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
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
