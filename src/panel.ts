import { Stylesheet } from './lib/stylesheet';
import { Issues, Source } from './lib/types';
import Vue from 'vue';
import App from './ui/App.vue';
import Error from './ui/Error.vue';
import { browsers } from './lib/browsers';
import { getAllCssSources, manageThemeColorChange, reloadOnNavigation } from './lib/browser-tasks';

manageThemeColorChange();
reloadOnNavigation();

getAllCssSources().then((sources: Array<Source>) => {
  const stylesheets = new Stylesheet();
  sources.forEach(stylesheetData => {
    stylesheets.add(stylesheetData);
  });
  return stylesheets.parse();
}).then(compat => {
  new Vue({
    el: '#app',
    components: {
      App
    },
    render(h) {
      return h('App', {
        props: {
          compat
        }
      });
    }
  });
}).catch(error => {
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
});
