import StyleSheet from './lib/StyleSheet';
import semverCompare from 'semver-compare';
import Vue from 'vue';
import App from './ui/app.vue';
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
    const versions = Object.keys(data[browser]).sort(semverCompare);
    compat[browser] = [{
      versions: [versions[0]],
      data: data[browser][versions[0]]
    }];
    let i = 0;
    while (++i < versions.length) {
      if (Object.keys(compat[browser][0].data).length === Object.keys(data[browser][versions[i]]).length) {
        compat[browser][0].versions.push(versions[i]);
      } else {
        compat[browser].unshift({
          versions: [versions[i]],
          data: data[browser][versions[i]]
        });
      }
    }
  });

  new Vue({
    el: '#app',
    components: {
      App
    },
    render(h) {
      return h('app', {
        props: {
          compat,
          browsersData: Array.from(browsersMap)
        }
      });
    }
  });

}).catch(err => {
  console.log(err);
});
