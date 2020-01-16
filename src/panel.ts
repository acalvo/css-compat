import { Source, Stylesheet } from './lib/stylesheet';
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
}).then(({ data, failedSources, stylesheets, allSources }) => {
  const compat = {};
  // TODO: should be part of Stylesheets class
  Object.keys(data).forEach(browser => {
    compat[browser] = [];
    const releases = browsers.get(browser).releases.entries();
    let result = releases.next();
    while (!result.done) {
      const releaseData = data[browser][result.value[0]];
      if (compat[browser].length === 0
        || Object.keys(compat[browser][0].data).length !== Object.keys(releaseData).length
        || Object.keys(releaseData).length !== (new Set(Object.keys(compat[browser][0].data).concat(Object.keys(releaseData)))).size) {
        compat[browser].unshift({
          versions: {
            first: result.value[0]
          },
          data: releaseData
        });
      } else {
        compat[browser][0].versions.last = result.value[0];
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
