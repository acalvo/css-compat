import { Helpers } from './helpers';
import postcss from 'postcss';
import compatData from './data.json';

export class Match {

  public static property(text: string): { property: string; prefix: string } {
    let property = postcss.vendor.unprefixed(text);
    const prefix = text.replace(property, '');
    if (property.startsWith('--')) {
      property = 'custom-property';
    }
    if (!compatData.css.properties[property]?.__compat) {
      return { property: '', prefix: '' };
    }
    return { property, prefix };
  }

  public static value(text: string, property: string): { value: string; prefix: string } {
    const propertyCompatData = compatData.css.properties[property];
    const prefixRE = new RegExp(`(${Helpers.getPossiblePrefixes().join('|')})$`);
    for (const value in propertyCompatData) {
      if (!propertyCompatData[value].__compat || propertyCompatData[value].__compat.status.deprecated) {
        continue;
      }
      const pos = text.indexOf(value);
      const pre = text.substr(0, pos);
      if (pos !== -1 && !pre.match(/[a-z]$/) && (!pre.endsWith('-') || pre.match(prefixRE))) {
        return { value, prefix: Helpers.getPossiblePrefixes().find(p => pre.endsWith(p)) || '' };
      }
    }
    return { value: '', prefix: '' };
  }

  public static selector(text: string): string {
    let selector = text.replace(/^:*/, '');
    switch (text) {
      case ' ':
        selector = 'descendant';
        break;
      case '+':
        selector = 'adjacent_sibling';
        break;
      case '>':
        selector = 'child';
        break;
      case '~':
        selector = 'general_sibling';
        break;
      case '||':
        selector = 'column';
        break;
    }
    if (compatData.css.selectors[selector]?.__compat) {
      return selector;
    }
    return '';
  }

}
