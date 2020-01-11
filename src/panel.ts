import StyleSheet from './lib/StyleSheet';
import Vue from 'vue';
import App from './ui/App.vue';
import Error from './ui/Error.vue';
import { browsersMap } from './lib/browsers';
import { getAllCssSources, manageThemeColorChange, reloadOnNavigation } from './lib/browser-tasks';

manageThemeColorChange();
reloadOnNavigation();

getAllCssSources().then((sources: Array<{ id: string | number; content: string; external: boolean }>) => {
  const stylesheets = new StyleSheet();
  sources.forEach(stylesheetData => {
    stylesheets.add(stylesheetData);
  });
  return stylesheets.parse();
}).then(({ data, failedSources, stylesheets, allSources }) => {
  const compat = {};
  // TODO: should be part of Stylesheets class
  Object.keys(data).forEach(browser => {
    compat[browser] = [];
    const releases = browsersMap.get(browser).releases.entries();
    let result = releases.next();
    while (!result.done) {
      if (compat[browser].length === 0 || Object.keys(compat[browser][0].data).length !== Object.keys(data[browser][result.value[0]]).length) {
        compat[browser].unshift({
          versions: {
            first: result.value[0]
          },
          data: data[browser][result.value[0]]
        });
      } else {
        compat[browser][0].versions.last = result.value[0]
      }
      result = releases.next();
    }
  });

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
