<template>
    <div class="article-page">
        <div class="title">四.应用间通信</div>
        <p>
            在开始介绍 qiankun 的应用通信之前，我们需要先了解微前端架构如何划分子应用。
        </p>
        <p>
            在微前端架构中，我们应该按业务划分出对应的子应用，而不是通过功能模块划分子应用。这么做的原因有两个：
        </p>
        <p>
            1.在微前端架构中，子应用并不是一个模块，而是一个独立的应用，我们将子应用按业务划分可以拥有更好的可维护性和解耦性。
        </p>
        <p>
            2.子应用应该具备独立运行的能力，应用间频繁的通信会增加应用的复杂度和耦合度。
        </p>
        <p>
            综上所述，我们应该从业务的角度出发划分各个子应用，尽可能减少应用间的通信，从而简化整个应用，使得我们的微前端架构可以更加灵活可控。
        </p>

        <h3><span class="mark">Actions</span> 通信</h3>
        <p>这是<span class="mark">qiankun</span>官方提供的应用间通信方式</p>
        <h4>通信原理</h4>
        <p>
            <span class="mark">qiankun</span> 内部提供了 <span class="mark">initGlobalState</span> 方法用于注册 <span class="mark">MicroAppStateActions</span> 实例用于通信，该实例有三个方法，分别是：
        </p>
        <p>
            1.<span class="mark">onGlobalStateChange: (callback: OnGlobalStateChangeCallback, fireImmediately?: boolean) => void</span>， 在当前应用监听全局状态，有变更触发<span class="mark"> callback，fireImmediately = true </span>立即触发 <span class="mark">callback</span>
        </p>
        <p>
            2.<span class="mark">setGlobalState: (state: Record&lt;string, any>) => boolean</span>， 按一级属性设置全局状态，微应用中只能修改已存在的一级属性
        </p>
        <p>
            3.<span class="mark">offGlobalStateChange: () => boolean</span>，移除当前应用的状态监听，微应用 <span class="mark">umount</span> 时会默认调用
        </p>
        <p>
            我们来画一张图来帮助大家理解（见下图）
        </p>
        <img src="./imgs/01.png" style="width:100%;" alt="">
        <p>
            我们从上图可以看出，我们可以先注册 观察者 到观察者池中，然后通过修改 globalState 可以触发所有的 观察者 函数，从而达到组件间通信的效果。
        </p>

        <h3>实战教学</h3>
        <p>我们将<span class="mark">Actions</span>通信和<span class="mark">vuex</span>结合起来使用</p>

        <h4>主应用的工作</h4>
        <p>
            首先，我们在主应用中注册一个 <span class="mark">MicroAppStateActions</span> 实例并导出，代码实现如下：
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/shared/actions.js
            import { initGlobalState } from "qiankun";

            const initialState = {};
            const actions = initGlobalState(initialState);

            export default actions;
        </code></pre>
        <p>
            本例中我们需要通信的数据是用户信息，所以我们封装一下 发送用户信息 和 监听用户信息的函数
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/utils/action.js

            //导入刚刚注册并导出的actions实例
            import actions from "@/shared/actions";

            //设置用户信息全局状态
            export function sendUserInfo(info){
                //属性名为userInfo
                actions.setGlobalState({ userInfo:info });
            }

            //监听全局的用户信息
            export function watchUserInfo(func,bool){
                //注册 观察者 函数
                actions.onGlobalStateChange(func,bool);
            }
        </code></pre>
        <p>
            然后主应用登录后，使用<span class="mark">vuex</span>存储<span class="mark">userInfo</span>，然后在<span class="mark">App.vue</span>中监听<span class="mark">userInfo</span>，若<span class="mark">userInfo</span>改变，则使用 <span class="mark">sendUserInfo </span>发送<span class="mark">userInfo</span> 的数据，具体代码如下：
        </p>
        <pre v-highlightjs><code class="javascript">
            //src/App.vue

            import {sendUserInfo,watchUserInfo} from "@/utils/actions";
            import { mapGetters } from 'vuex'

            export default {
                name: 'App',
                components:{
                    layout: () => import("@/layout/index.vue")
                },
                data(){
                   return {

                   }
                },
                computed: {
                    ...mapGetters([
                        'userInfo'
                    ])
                },
                 watch:{
                    userInfo(newVal,oldVal){
                        //监听到userInfo改变的时候发送userInfo
                        if(newVal){
                            sendUserInfo(newVal)
                        }
                    }
                },
                mounted() {
                    //mounted的时候发送一遍userInfo
                    sendUserInfo(this.userInfo)
                },
            }
        </code></pre>

        <h4>子应用的工作</h4>
        <p>
            我们已经完成了主应用的登录功能，将 <span class="mark">userInfo</span> 信息记录在了 <span class="mark">globalState</span> 中。现在，我们进入子应用，使用 <span class="mark">userInfo</span> 获取用户信息并展示在页面中。
        </p>
        <p>
            我们首先来改造我们的<span class="mark"> Vue </span>子应用，首先我们设置一个 <span class="mark">Actions</span> 实例，代码实现如下：
        </p>
        <pre v-highlightjs><code class="javascript">
            //src/shared/actions.js

            function emptyAction() {
                // 警告：提示当前使用的是空 Action
                console.warn("Current execute action is empty!");
            }

            class Actions {
                // 默认值为空 Action
                actions = {
                    onGlobalStateChange: emptyAction,
                    setGlobalState: emptyAction
                };
                
                /**
                * 设置 actions
                */
                setActions(actions) {
                    this.actions = actions;
                }
            
                /**
                * 映射
                */
                onGlobalStateChange(...args) {
                    return this.actions.onGlobalStateChange(...args);
                }
            
                /**
                * 映射
                */
                setGlobalState(...args) {
                    return this.actions.setGlobalState(...args);
                }
            }
            
            const actions = new Actions();
            export default actions;
        </code></pre>
        <p>
            我们创建 <span class="mark">actions</span> 实例后，我们需要为其注入真实 <span class="mark">Actions</span>。我们在入口文件 <span class="mark">main.js</span> 的 <span class="mark">render</span> 函数中注入，代码实现如下：
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/main.js

            import actions from "@/shared/actions";

            //....
            //....
            /**
            * 渲染函数
            * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
            */
            function render(props) {
                if (props) {
                    // 注入 actions 实例
                    actions.setActions(props);
                }
                //.......
            }
            //....
            //.....
        </code></pre>

        <p>
            从上面的代码可以看出，挂载子应用时将会调用 <span class="mark">render</span> 方法，我们在 <span class="mark">render</span> 方法中将主应用的 <span class="mark">actions</span> 实例注入即可。
        </p>

        <p>
            然后子应用种也封装一下 发送用户信息 和 监听用户信息的函数
        </p>
        <pre v-highlightjs><code class="javascript">
            // src/utils/action.js

            //导入actions实例
            import actions from "@/shared/actions";

            //设置用户信息全局状态
            export function sendUserInfo(info){
                //属性名为userInfo
                actions.setGlobalState({ userInfo:info });
            }

            //监听全局的用户信息
            export function watchUserInfo(func,bool){
                //注册 观察者 函数
                actions.onGlobalStateChange(func,bool);
            }
        </code></pre>

        <p>
            然后我们在子应用 <span class="mark">App.vue</span> 页面中监听 <span class="mark">globalState</span> 中的 <span class="mark">userInfo</span>，并存入子应用<span class="mark">vuex</span>。代码实现如下:
        </p>

        <pre v-highlightjs><code class="javascript">
            // src/App.vue

            import {watchUserInfo} from "@/utils/actions";
            import { mapMutations } from 'vuex'

            export default {
                name: 'App',
                data(){
                    return{                     
                    
                    }
                },           
                mounted() {
                    watchUserInfo((state, prevState) => {
                        // state: 变更后的状态; prevState: 变更前的状态
                        let {userInfo} = state
                        // 将userInfo 存入 vuex
                        this.setUserInfo(userInfo)
                    })
                },
                methods:{
                    ...mapMutations({
                        setUserInfo: 'SET_USERINFO'
                    })
                }
            }
        </code></pre>

        <p>
            最后我们在子应用的 "获取主应用数据"  页面获取 <span class="mark">vuex</span> 中的 <span class="mark">userInfo</span>，使用 <span class="mark">userInfo</span> 来获取用户信息，最后在页面中显示用户信息。代码过于简单就不展示了，最后效果如下：
        </p>
        <img src="./imgs/02.png" style="width:100%;" alt="">

        <p>到这里就实现应用间的通信啦~下一讲我们学习如何将微应用部署到服务器上</p>
        <br>
        <br>
        <br>
        <p>参考文档：</p>
        <p>
            <a target="_blank" href="https://blog.csdn.net/qq_34621851/article/details/106003110">基于 qiankun 的微前端最佳实践（图文并茂） - 应用间通信篇</a>
        </p>
    </div>
</template>