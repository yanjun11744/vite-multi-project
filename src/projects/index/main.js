import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/index.scss'

const app = createApp(App)
app.use(router).mount('#app')
// 自定义指令
app.directive('th', {
    created(el, binding) {
        // 根据 binding.value 处理逻辑
        el.setAttribute(binding.arg, binding.value);
    }
});