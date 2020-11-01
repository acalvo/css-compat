import fs from 'fs';
import path from 'path';
import { browsers as browsersJson, css } from '@mdn/browser-compat-data';
import { BrowserNames } from '@mdn/browser-compat-data/types';
import { browsers } from './../src/lib/browsers';

(Object.keys(browsersJson) as Array<BrowserNames>).forEach(b => {
  if (!browsers.get(b)) {
    delete browsersJson[b];
    return;
  }
  Object.keys(browsersJson[b].releases).forEach(r => {
    if (browsersJson[b].releases[r].status === 'planned' || (b === 'edge' && parseInt(r) > 18)) {
      delete browsersJson[b].releases[r];
    }
  });
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
      if (!browsers.get(b)) {
        delete obj['__compat']['support'][b];
      }
    });
  }
})(css);

fs.writeFile(
  path.resolve(__dirname, '..', 'src', 'lib', 'data.json'),
  JSON.stringify({ browsers: browsersJson, css }, null, '  '),
  err => {
    if (err) {
      console.error(err);
    }
  }
);
