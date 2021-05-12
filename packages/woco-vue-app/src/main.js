import { createApp } from 'vue'
import App from './App.vue'
import { msg } from '@my-virtual-file'
console.log(msg)
createApp(App).mount('#app')
