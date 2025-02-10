import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";
import "vant/lib/index.css";
import "./styles/global.css";
import CommonNavBar from "./components/CommonNavBar.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.component("CommonNavBar", CommonNavBar);

app.use(pinia);
app.use(router);

app.mount("#app");
