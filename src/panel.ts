import { Stylesheets } from './lib/stylesheets';
import Vue from 'vue';
import App from './ui/App.vue';
import Error from './ui/Error.vue';
import { BrowserTasks } from './lib/browser-tasks';

(async () => {
  try {
    BrowserTasks.manageThemeColorChange();
    BrowserTasks.reloadOnNavigation();
    const sources = await BrowserTasks.getAllCssSources();
    const stylesheets = new Stylesheets();
    await Promise.all(sources.map(source => stylesheets.add(source)));
    new Vue({
      el: '#app',
      components: {
        App
      },
      render(h) {
        return h('App', {
          props: {
            stylesheets
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    new Vue({
      el: '#app',
      components: {
        Error
      },
      render(h) {
        return h('Error', {
          props: {
            error
          }
        });
      }
    });
  }
})();
