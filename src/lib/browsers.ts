import { BrowserNames } from 'mdn-browser-compat-data/types';
import { browsers } from './data.json';
import semverCompare from 'semver-compare';

const browsersOrder: Array<BrowserNames> = [
  'chrome',
  'firefox',
  'safari',
  'edge',
  'ie'
];

const browsersMap: Map<string, { key: string; name: string; releases: Map<any, any> }> = new Map();
browsersOrder.forEach(k => {
  const releases = new Map();
  Object.keys(browsers[k].releases).sort(semverCompare).reverse().forEach(v => {
    releases.set(v, browsers[k].releases[v]);
  });
  browsersMap.set(k, {
    key: k,
    name: browsers[k].name,
    releases
  });
});

export { browsersMap };
