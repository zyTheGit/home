import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "vant/lib/index.css";
import "./styles/global.css";
import CommonNavBar from "./components/CommonNavBar.vue";
import * as VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import pinia from './stores';

const app = createApp(App);
app.component("CommonNavBar", CommonNavBar);

app.use(pinia);
app.use(router);
app.use((VueVirtualScroller as any).default || VueVirtualScroller);

app.mount("#app");
