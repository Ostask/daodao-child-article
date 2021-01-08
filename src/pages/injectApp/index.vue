<template>
    <div class="article-page">
        <div class="title">三.注册子应用</div>
        <p>
            前两节中，主应用和子应用都带大家改造完毕了，那么我们如何在主应用中接入子应用呢？
        </p>
        <h3>注册微应用</h3>
        <p>先前改造主应用时，主应用的 <span class="mark">src/micro/apps.js</span> 中的<span class="mark">apps</span>是空的，现在我们来填完整</p>
        <pre v-highlightjs><code class="javascript">
            // 主应用 src/micro/apps.js

            const apps = [
                /**
                * name: 微应用名称 - 具有唯一性
                * entry: 微应用入口 - 通过该地址加载微应用
                * container: 微应用挂载节点 - 微应用加载完成后将挂载在该节点上
                * activeRule: 微应用触发的路由规则 - 触发路由规则后将加载该微应用
                */
                {
                    name: "daodaodemo",
                    entry: "//192.168.2.122:10300",
                    container: "#frame",
                    activeRule: "#/daodaodemo", //由于是hash路由，所以 # 号是一定要的
                },
            ]
            export default apps
        </code></pre>
        <p>
            通过上面的代码，我们就在主应用中注册了我们的 <span class="mark">daodaodemo</span> 微应用，进入 <span class="mark">#/daodaodemo</span> 路由时将加载我们的 <span class="mark">daodaodemo</span> 微应用。
        </p>

        <h3>配置主应用菜单</h3>
        <p>为了让主应用的<span class="mark">nav</span>组件能够显示微应用页面导航，我们配置一下主应用的 <span class="mark">/src/data/nav.js</span>菜单，以后这个菜单也可以是配置在后台通过接口拉取</p>

        <pre v-highlightjs><code class="javascript">
            // 主应用 src/data/nav.js
            export default [
                {
                    title: "开始",
                    path: "/",
                },
                {
                    title: "功能示例",  //这里是daodaodemo子应用下的页面
                    path: "/daodaodemo",
                    children:[
                        {
                            title:'百度地图示例',
                            path:"/daodaodemo"
                        },
                        {
                            title:'3d示例',
                            path:"/daodaodemo/three"
                        },
                        {
                            title:'获取主应用数据',
                            path:"/daodaodemo/data"
                        },
                        {
                            title:'子应用调用接口',
                            path:"/daodaodemo/query"
                        },
                        {
                            title:'echarts示例',
                            path:"/daodaodemo/charts"
                        }
                    ]
                }
            ]
        </code></pre>

        <p>
            现在启动主应用和子应用，就可以看到左侧菜单栏出现刚刚配置的菜单。单击相应菜单就可以看到相应子应用的页面了。
        </p>
        <p>
            下一讲我们学习<span class="mark">子应用和主应用之间如何通信</span>
        </p>
        <br>
        <br>
        <br>
        <p>参考文档：</p>
        <p>
            <a target="_blank" href="https://blog.csdn.net/qq_34621851/article/details/106104615">基于 qiankun 的微前端最佳实践（万字长文） - 从 0 到 1 篇</a>
        </p>
    </div>
</template>