import { createApp } from 'vue'
import App from './App.vue'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './assets/main.css'
import './modules/students/styles/studentModule.css'

createApp(App).use(Antd).mount('#app')
