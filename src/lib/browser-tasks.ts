import { Source } from './stylesheet';
import browser from 'webextension-polyfill';

export function getAllCssSources() {
  const getExternalStyles = () => {
    return Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(node => {
      const href = node.getAttribute('href');
      if (href.indexOf('//') === 0) {
        return window.location.protocol + href;
      }
      if (href.indexOf('/') === 0) {
        return window.location.origin + href;
      }
      return href;
    });
  };
  const getInlineStyles = () => {
    return Array
      .from(document.getElementsByTagName('style'))
      .map(node => node.textContent)
      .filter(content => content.length > 0);
  };

  const inlineSourcesPromise = browser.devtools.inspectedWindow.eval(`(${getInlineStyles.toString()})()`)
    .then(([inlineStylesheets, error]: [Array<string>, any]) => {
      if (error) {
        return Promise.reject(error);
      }
      return inlineStylesheets
        .filter(c => typeof c === 'string' && c.length > 0)
        .map((content, i) => ({
          id: i + 1,
          content,
          external: false
        } as Source));
    });

  const externalSourcesPromise = browser.devtools.inspectedWindow.eval(`(${getExternalStyles.toString()})()`)
    .then(([stylesheetUrls, error]: [Array<string>, any]) => {
      if (error) {
        return Promise.reject(error);
      }
      const queue = stylesheetUrls.map(url => {
        return fetch(url)
          .then(response => response.text())
          .then(response => ({
            url,
            content: response
          }))
          .catch(err => {
            console.log('Could not fetch source:', url);
          });
      });
      return Promise.all(queue);
    }).then(results => {
      return results.filter(Boolean);
    }).then((sources: Array<{ url: string; content: string }>) => {
      return sources.map(source => ({
        id: source.url,
        content: source.content,
        external: true
      } as Source));
    });

  return Promise.all([externalSourcesPromise, inlineSourcesPromise])
    .then(([externalSources, inlineSources]) => externalSources.concat(inlineSources));
}

export function manageThemeColorChange() {
  window?.addEventListener('DOMContentLoaded', () => {
    const setTheme = theme => document.documentElement.dataset.theme = theme;
    setTheme(browser.devtools.panels.themeName);
    browser.devtools.panels.onThemeChanged.addListener(setTheme);
  });
}

export function reloadOnNavigation() {
  browser.devtools.network.onNavigated.addListener((url) => location.reload());
}
