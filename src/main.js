import { createApp } from 'vue';          // Import Vue
import { createVuetify } from 'vuetify';  // Import Vuetify
import 'vuetify/styles';                  // Import Vuetify styles
import App from './App.vue';              // Import your root Vue component

const app = createApp(App);              // Create Vue app instance
const vuetify = createVuetify();         // Create Vuetify instance

app.use(vuetify);                        // Use Vuetify with your app
app.mount('#app');                       // Mount the app to the DOM
    