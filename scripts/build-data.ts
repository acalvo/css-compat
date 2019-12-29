import fs from 'fs';
import path from 'path';
import { BrowserNames } from 'mdn-browser-compat-data/types';
import { browsers, css } from 'mdn-browser-compat-data';
import { browsersMap } from './../src/lib/browsers';

(Object.keys(browsers) as Array<BrowserNames>).forEach(b => {
  if (!browsersMap.get(b)) {
    delete browsers[b];
  }
});

(function cleanBrowsers(obj) {
  if (obj) {
    Object.keys(obj).forEach(k => {
      if (k !== '__compat') {
        cleanBrowsers(obj[k]);
      }
    });
  }
  if (obj['__compat']) {
    (Object.keys(obj['__compat']['support']) as Array<BrowserNames>).forEach(b => {
      if (!browsersMap.get(b)) {
        delete obj['__compat']['support'][b];
      }
    });
  }
})(css);

fs.writeFile(
  path.resolve(__dirname, '..', 'src', 'lib', 'data.json'),
  JSON.stringify({ browsers: browsers, css }, null, '  '),
  err => {
    if (err) {
      console.error(err);
    }
  }
);
