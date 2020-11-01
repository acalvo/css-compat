import semverCompare from 'semver-compare';
import data from './data.json';
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
  Object.keys(data.browsers[k].releases).sort(semverCompare).forEach(v => {
    releases.set(v, data.browsers[k].releases[v]);
  });
  browsers.set(k, {
    name: data.browsers[k].name,
    releases
  });
});

export { browsers };
