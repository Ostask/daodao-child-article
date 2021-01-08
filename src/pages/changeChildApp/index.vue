<template>
    <div class="article-page">
        <div class="title">二.将普通vue项目改造成子应用</div>

        <h3>引言</h3>
        <p>上一讲教大家如何将普通vue项目改造成主应用，这一讲教大家如何将普通vue项目改造成子应用</p>

        <p>
            首先创建一个vue项目，使用vue-cli4
        </p>

        <h3>配置微应用</h3>
         <p>
            子应用本身并不需要安装<span class="mark">qiankun</span>。
            将普通的项目改造成<span class="mark">qiankun</span>子应用，需要进行两步操作：
        </p>
        <p>
            1. 导出相应的生命周期钩子；
        </p>
        <p>
            2. 配置微应用的打包工具
        </p>

        <h4>导出相应的生命周期钩子:</h4>
        <p>
            微应用需要在自己的入口 js (通常就是你配置的 webpack 的 entry js) 导出 <span class="mark">bootstrap</span>、<span class="mark">mount</span>、<span class="mark">unmount</span> 三个生命周期钩子，以供主应用在适当的时机调用。
        </p>
        <pre v-highlightjs><code class="javascript">
            /**
            * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
            * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
            */
            export async function bootstrap() {
                console.log('react app bootstraped');
            }
            /**
            * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
            */
            export async function mount(props) {
                ReactDOM.render(&lt;App />, props.container ? props.container.querySelector('#root') : document.getElementById('root'));
            }
            /**
            * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
            */
            export async function unmount(props) {
                ReactDOM.unmountComponentAtNode(props.container ? props.container.querySelector('#root') : document.getElementById('root'));
            }
            /**
            * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
            */
            export async function update(props) {
                console.log('update props', props);
            }
        </code></pre>

        <p>
            首先我们在子应用的入口文件<span class="mark">main.js</span>中，导出<span class="mark">qiankun</span>主应用所需要的三个生命周期钩子函数，代码实现如下
        </p>

        <pre v-highlightjs><code class="javascript">
            // src/main.js


            import Vue from 'vue'
            import VueRouter from 'vue-router'

            import "./public-path";

            import App from './App.vue'
            import routes from "./router"

            import store from './store'
        
            const packageName = require('../package.json').name;

            Vue.config.productionTip = false
            Vue.use(VueRouter)

            let instance = null;
            let router = null;

            /**
            * 渲染函数
            * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
            */
            function render(props) {
                // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
                router = new VueRouter({
                    routes,
                });

                // 判断 qiankun 环境则进行路由拦截，判断跳转路由是否有 packageName 开头前缀，没有则加上
                if(window.__POWERED_BY_QIANKUN__){
                    router.beforeEach((to, from, next) => {
                        if(!to.path.includes('/'+packageName)){
                            next({
                            path: '/' + packageName + to.path
                            })
                        }else{
                            next()
                        }
                    })
                }

                // 挂载应用
                instance = new Vue({
                    router,
                    store,
                    render: (h) => h(App),
                }).$mount("#app");
            }

            // 独立运行时，直接挂载应用
            if (!window.__POWERED_BY_QIANKUN__) {
                render();
            }

            /**
            * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
            * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
            */
            export async function bootstrap() {
                console.log("VueMicroApp bootstraped");
            }

            /**
            * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
            */
            export async function mount(props) {
                console.log("VueMicroApp mount", props);
                render(props);
            }

            /**
            * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
            */
            export async function unmount() {
                console.log("VueMicroApp unmount");
                instance.$destroy();
                instance = null;
                router = null;
            }
        </code></pre>

        <p>
            我们将render函数进行了封装，如此一来保证了子应用可以单独运行，也可以在主应用中运行时在mount钩子里触发render函数
        </p>
        <p>
            webpack 默认的 publicPath 为 "" 空字符串，会基于当前路径来加载资源。我们在主应用中加载微应用时需要重新设置 publicPath，这样才能正确加载微应用的相关资源。（public-path.js 具体实现在后面）
        </p>

        <pre v-highlightjs><code class="javascript">
            // src/public-path.js
            if (window.__POWERED_BY_QIANKUN__) {
                // 动态设置 webpack publicPath，防止资源加载出错
                // eslint-disable-next-line no-undef
                __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
            }
        </code></pre>

        <h4>
            配置子应用自身路由
        </h4>
        <p>
            网上资料大多数都使用history模式路由，但是此模式比较依赖后端，所以我将路由模式改成了 hash 模式
        </p>

        <pre v-highlightjs><code class="javascript">
            // src/router/index.js

            const packageName = require('../../package.json').name;

            // 判断是 qiankun 环境则增加路由前缀
            let prefix = ''
            if(window.__POWERED_BY_QIANKUN__){
                prefix = '/'+packageName
            }

            const routes = [
                {
                    path:prefix + "/",
                    name:"Map",
                    component:() => import('@/pages/map.vue')
                },
                {
                    path:prefix + "/three",
                    name:"Three",
                    component:() => import('@/pages/three.vue')
                },
                {
                    path:prefix + "/data",
                    name:"Getdata",
                    component:() => import('@/pages/getData.vue')
                },
                {
                    path:prefix + "/query",
                    name:"Query",
                    component:() => import('@/pages/projects.vue')
                },
                {
                    path:prefix + "/charts",
                    name:"Charts",
                    component:() => import('@/pages/charts.vue')
                }
            ]

            export default routes
        </code></pre>

        <h4>配置子应用的打包工具</h4>
        <p>我们配置好<span class="mark">main.js</span>和路由后，还需要配置<span class="mark">webpack</span>，这个项目中我们配置 <span class="mark">vue.config.js</span>，代码实现如下：</p>

        <pre v-highlightjs><code class="javascript">
            const path = require("path");
            const packageName = require('./package.json').name;

            module.exports = {
            devServer: {
                // 监听端口
                port: 10300,
                // 关闭主机检查，使微应用可以被 fetch
                disableHostCheck: true,
                // 配置跨域请求头，解决开发环境的跨域问题
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            },
            configureWebpack: {
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "src"),
                    },
                },
                output: {
                    // 微应用的包名，这里与主应用中注册的微应用名称一致
                    library: `${packageName}-[name]`,
                    // 将你的 library 暴露为所有的模块定义下都可运行的方式
                    libraryTarget: "umd",
                    // 按需加载相关，设置为 webpackJsonp_VueMicroApp 即可
                    jsonpFunction: `webpackJsonp_${packageName}`,
                },
              },
            };
        </code></pre>
        <p>
            我们需要重点关注一下 <span class="mark">output</span> 选项，当我们把 <span class="mark">libraryTarget</span> 设置为 <span class="mark">umd</span> 后，我们的 <span class="mark">library</span> 就暴露为所有的模块定义下都可运行的方式了，主应用就可以获取到微应用的生命周期钩子函数了。
        </p>

        <p>
            到这里子应用已经改造完毕了，下一讲我们学习如何将子应用接入到主应用
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