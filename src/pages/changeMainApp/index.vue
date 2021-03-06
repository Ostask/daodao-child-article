<template>
    <div class="article-page">
        <div class="title">一.将普通vue项目改造成主应用</div>
        <h3>引言</h3>
        <p>本教程将引导大家将普通的vue项目改造成<span class="mark">qiankun</span>微前端基座，大家有没有发现，其实本教程就是使用了<span class="mark">qiankun</span>改造成的微前端应用。</p>

        <h3>构建主应用基座</h3>
        <p>
            我们先使用<span class="mark">vue-cli</span> 生成一个<span class="mark">Vue</span>的项目，初始化主应用。本教程使用的是vue-cli4版本，如果版本低的可以先升级。
        </p>
        <p>
            将普通的项目改造成<span class="mark">qiankun</span>主应用基座，需要进行三步操作：
        </p>
        <p>
            1.创建微应用容器 - 用于承载微应用，渲染显示微应用；
        </p>
        <p>
            2.注册微应用 - 设置微应用激活条件，微应用地址等等；
        </p>
        <p>
            3.启动<span class="mark">qiankun</span>；
        </p>

        <h4>创建微应用容器</h4>
        <p>
            我们先在主应用中创建微应用的承载容器，这个容器规定了微应用的显示区域，微应用将在该容器内渲染并显示。我们先设置主应用自身的路由。代码如下：
            <pre v-highlightjs><code class="javascript">
            // src/router/index.js    

            import Vue from 'vue'
            import VueRouter from 'vue-router'

            Vue.use(VueRouter)

            const routes = [
                {
                    path:"/",
                    name:"Home",
                    component:() => import("../pages/start.vue") //开始界面
                },
                {
                    path:"/login",
                    name:"Login",
                    component:() => import("../pages/login.vue"), //登录界面
                    meta:{ 
                        fullscreen:true //是否全屏
                    }
                }
            ]

            export default new VueRouter({ //网上大多数都是使用history模式，但是我使用的是hash模式
                routes
            })
            </code></pre>

            <pre v-highlightjs><code class="javascript">
            //    src/main.js
            import Vue from 'vue'
            import App from './App.vue'
            import router from "./router"
            import store from './store'

            Vue.config.productionTip = false

            new Vue({
                router,
                store,
                render: h => h(App),
            }).$mount('#app')
            </code></pre>
        </p>
        <p>
            我们现在来设置主应用的布局，我们会有一个菜单和显示区域，代码实现如下：
        </p>
        <p>
            首先是菜单配置：(目前只有主应用的一个页面要显示在菜单上)
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/data/nav.js
            export default [
                {
                    title: "开始",
                    path: "/",
                }
            ]
        </code></pre>
        <p>
            这是App.vue。我将布局写在了layout中。
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/App.vue
            &lt;template&gt;
            &lt;div class="main-contenter"&gt;
                &lt;layout&gt;&lt;/layout&gt;
            &lt;/div&gt;
            &lt;/template&gt;

            &lt;script&gt;
            export default {
                name: 'App',
                components:{
                    layout: () => import("@/layout/index.vue")
                },
            }
            &lt;/script&gt;
        </code></pre>
        <p>
            接下来查看layout
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/layout/index.vue
            &lt;template>
                &lt;div class="layout-content">
                    &lt;div class="header" v-if="!$route.meta.fullscreen">
                        &lt;!--头部组件-->
                        &lt;header-component>&lt;/header-component>
                    &lt;/div>
                    &lt;div class="content">
                        &lt;div class="nav" v-if="!$route.meta.fullscreen">
                            &lt;!--导航组件-->
                            &lt;nav-component>&lt;/nav-component>
                        &lt;/div>
                        &lt;div class="frame-wrapper" :style="$route.name&&!$route.meta.fullscreen?'padding:10px;':'padding:0px;'">
                        &lt;!--主应用渲染区，用于挂载主应用路由触发的组件，使用$route.name来判断是不是主应用组件-->
                        &lt;router-view v-show="$route.name">&lt;/router-view> 
                        &lt;!--子应用渲染区，用户挂载子应用节点-->
                        &lt;div v-show="!$route.name" id="frame" :style="!$route.name&&!$route.meta.fullscreen?'padding:10px;':'padding:0px;'">&lt;/div> 
                        &lt;/div>
                    &lt;/div>
                &lt;/div>
            &lt;/template>
        </code></pre>

        <p>
            nav.vue是用来渲染左侧导航栏的组件
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/layout/nav.vue
            &lt;template>
                &lt;div class="nav-content">
                    &lt;el-menu>
                        &lt;template v-for="(item,index) in navData">
                            &lt;el-menu-item @click="goto(item.path)" :index="'nav'+index" :key="'nav'+index" v-if="!item.children || item.children.length == 0">
                                &lt;span slot="title"><span v-pre>{{item.title}}</span>&lt;/span>
                            &lt;/el-menu-item>
                            &lt;el-submenu v-if="item.children && item.children.length > 0" :index="'nav'+index" :key="'nav'+index">
                                &lt;span slot="title"><span v-pre>{{item.title}}</span>&lt;/span>
                                &lt;el-menu-item @click="goto(child.path)" v-for="(child,idx) in item.children" :key="'nav'+index+'-'+idx" :index="'nav'+index+'-'+idx"><span v-pre>{{child.title}}</span>&lt;/el-menu-item>
                            &lt;/el-submenu>
                        &lt;/template>
                    &lt;/el-menu>
                &lt;/div>
            &lt;/template>

            &lt;script>
            import navData from "@/data/nav.js"

            export default {
                data(){
                    return {
                        navData:navData
                    }
                },
                methods:{
                    goto(path){
                        this.$router.push(path)
                    }
                }
            }
            &lt;/script>
        </code></pre>

        <h4>注册微应用</h4>
        <p>构建好主框架后，我们需要使用<span class="mark">qiankun</span>的<span class="mark">registerMicroApps</span>方法注册微应用，代码实现如下：</p>
        <p>首先主应用安装<span class="mark">qiankun</span></p>

        <pre v-highlightjs><code class="javascript">
            npm install qiankun -S
        </code></pre>

        <pre v-highlightjs><code class="javascript">
            // src/micro/app.js
            //此时我们还没有微应用，所以app为空
            const apps = [
                /**
                * name: 微应用名称 - 具有唯一性
                * entry: 微应用入口 - 通过该地址加载微应用
                * container: 微应用挂载节点 - 微应用加载完成后将挂载在该节点上
                * activeRule: 微应用触发的路由规则 - 触发路由规则后将加载该微应用
                */
            ]
            export default apps
        </code></pre>

        <pre v-highlightjs><code class="javascript">
            // src/micro/index.js
            import {
                registerMicroApps,
                addGlobalUncaughtErrorHandler,
                start,
            } from "qiankun";

            // 微应用注册信息
            import apps from "./apps";

            /**
            * 注册微应用
            * 第一个参数 - 微应用的注册信息
            * 第二个参数 - 全局生命周期钩子
            */
            registerMicroApps(apps, {
                // qiankun 生命周期钩子 - 微应用加载前
                beforeLoad: (app) => {
                    console.log("before load", app.name);
                    return Promise.resolve();
                },
                // qiankun 生命周期钩子 - 微应用挂载后
                afterMount: (app) => {
                    console.log("after mount", app.name);
                    return Promise.resolve();
                },
            });
            
            /**
            * 添加全局的未捕获异常处理器
            */
            addGlobalUncaughtErrorHandler((event) => {
                console.error(event);
                const { msg } = event;
                // 加载失败时提示
                if (msg && msg.includes("died in status LOADING_SOURCE_CODE")) {
                    console.error("微应用加载失败，请检查应用是否可运行");
                }
            });
            
            // 导出 qiankun 的启动函数
            export default start;
        </code></pre>

        <p>
            从上面可以看出，我们的微应用注册信息在 <span class="mark">apps</span> 数组中（此时为空，我们在后面接入微应用时会添加微应用注册信息），然后使用 <span class="mark">qiankun</span> 的 <span class="mark">registerMicroApps</span> 方法注册微应用，最后导出了 <span class="mark">start</span> 函数，注册微应用的工作就完成啦！
        </p>


        <h4>启动主应用</h4>
        <p>
            我们在注册好了微应用，导出 <span class="mark">start</span> 函数后，我们需要在合适的地方调用 <span class="mark">start</span> 启动主应用。
        </p>
        <p>
            本例中我们在layout的mounted钩子中启动<span class="mark">qiankun</span>主应用，以保证主应用加载时容器已经加载完毕，代码如下:
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/layout/index.vue

            //导入start函数
            import startQiankun from "@/micro"

            export default {
                data(){
                    return{

                    }
                },
                components:{
                    headerComponent:() => import("@/layout/header.vue"),
                    navComponent:() => import("@/layout/nav.vue")
                },
                mounted(){
                    //启动主应用
                    startQiankun()
                }
            }
        </code></pre>

        <p>
            至此，主应用改造完毕！
        </p>
        <p>最终实现效果如图(目前还没有这么多菜单，往后我会详细讲解)</p>
        <img style="width:100%;" src="./img/01.png" alt="">

        <p>下一节我们讲如何改造子应用</p>
        <br>
        <br>
        <br>
        <p>参考文档：</p>
        <p>
            <a target="_blank" href="https://blog.csdn.net/qq_34621851/article/details/106104615">基于 qiankun 的微前端最佳实践（万字长文） - 从 0 到 1 篇</a>
        </p>
    </div>
</template>