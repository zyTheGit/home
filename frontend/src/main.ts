import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'vant/lib/index.css'
import './styles/global.css'
import CommonNavBar from './components/CommonNavBar.vue'

const app = createApp(App)
app.component('CommonNavBar', CommonNavBar)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')