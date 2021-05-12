import { createApp } from 'vue'
import App from './App.vue'
import { msg } from 'test?woco'
console.log(msg)
createApp(App).mount('#app')
