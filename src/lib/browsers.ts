import semverCompare from 'semver-compare';
import { browsers as browsersJson } from './data.json';
import { BrowserKey } from './types';

const browsersOrder: Array<BrowserKey> = [
  'chrome',
  'firefox',
  'safari',
  'edge',
  'ie'
];

const browsers: Map<string, { name: string; releases: Map<string, any> }> = new Map();
browsersOrder.forEach(k => {
  const releases = new Map();
  Object.keys(browsersJson[k].releases).sort(semverCompare).forEach(v => {
    releases.set(v, browsersJson[k].releases[v]);
  });
  browsers.set(k, {
    name: browsersJson[k].name,
    releases
  });
});

export { browsers };
