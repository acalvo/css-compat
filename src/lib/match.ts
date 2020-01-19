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

}
