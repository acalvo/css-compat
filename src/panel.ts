import Vue from 'vue';
import App from './App.vue';
import { BrowserTasks } from './lib/browser-tasks';

BrowserTasks.manageThemeColorChange();
BrowserTasks.reloadOnNavigation();
new Vue({
  el: '#app',
  render: h => h(App)
});
