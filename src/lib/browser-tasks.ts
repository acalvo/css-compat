import { promisify } from 'util';
import { Source } from './types';

export class BrowserTasks {

  public static getAllCssSources(): Promise<Array<Source>> {
    const getExternalStyles = () => {
      return Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(node => {
        const href = node.getAttribute('href').trim();
        if (href.indexOf('//') === 0) {
          return window.location.protocol + href;
        }
        const base = document.querySelector('base')?.href || '';
        if (href.indexOf('/') === 0) {
          return (base.slice(0, -1) || window.location.origin) + href;
        }
        return (href.includes('://') ? '' : base) + href;
      });
    };
    const getInlineStyles = () => {
      return Array
        .from(document.getElementsByTagName('style'))
        .map(node => node.textContent)
        .filter(content => content.length > 0);
    };

    function execInInspectedWindow<T>(func: () => T) {
      return promisify((expression: string, callback: (err: any, result: unknown) => void) => {
        return chrome.devtools.inspectedWindow.eval(expression, (result, err) => callback(err, result));
      })(`(${func.toString()})()`) as Promise<T>;
    }

    const inlineSourcesPromise = execInInspectedWindow(getInlineStyles).then(inlineStylesheets => {
      return inlineStylesheets
        .filter(c => typeof c === 'string' && c.length > 0)
        .map((content, i) => ({
          id: `<inline style sheet #${i + 1}>`,
          content,
          external: false
        } as Source));
    });

    const externalSourcesPromise = execInInspectedWindow(getExternalStyles).then(stylesheetUrls => {
      const queue = stylesheetUrls.map(url => {
        return fetch(url)
          .then(response => response.text())
          .then(response => ({
            url,
            content: response
          }))
          .catch(err => {
            console.error('Could not fetch source:', url);
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

  public static manageThemeColorChange() {
    window.addEventListener('DOMContentLoaded', () => {
      const setTheme = theme => document.documentElement.dataset.theme = `${window['browser'] ? 'ff' : 'ch'}-${theme}`;
      setTheme(chrome.devtools.panels.themeName);
      (window as any).browser?.devtools.panels.onThemeChanged.addListener(setTheme);
    });
  }

  public static reloadOnNavigation() {
    chrome.devtools.network.onNavigated.addListener((url) => location.reload());
  }

}
