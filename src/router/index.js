const packageName = require('../../package.json').name;

// 判断是 qiankun 环境则增加路由前缀
let prefix = ''
if(window.__POWERED_BY_QIANKUN__){
    prefix = '/'+packageName
  }

const routes = [
    {
        path:prefix + "/",
        name:"Home",
        component:() => import('@/pages/createMain.vue')
    },
    {
        path:prefix + "/list",
        name:"List",
        component:() => import('@/pages/createChild.vue')
    },
    {
        path:prefix + "/changeMainApp",
        name:"ChangeMainApp",
        component:() => import('@/pages/changeMainApp/index.vue')
    },
    {
        path:prefix + "/changeChildApp",
        name:"ChangeChildApp",
        component:() => import('@/pages/changeChildApp/index.vue')
    },
    {
        path:prefix + "/injectApp",
        name:"InjectApp",
        component:() => import('@/pages/injectApp/index.vue')
    },
    {
        path:prefix + "/actions",
        name:"Actions",
        component:() => import('@/pages/actions/index.vue')
    }
]

export default routes