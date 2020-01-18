import { BrowserKey, Issues, Source } from './types';
import compatData from './data.json';
import { Helpers } from './helpers';
import postcss from 'postcss';

export class Declaration {

  constructor(
    private rule: postcss.Rule,
    private source: Source,
  ) {
  }

  public process(issues: Issues) {
    const declarations: { [key: string]: Array<postcss.Declaration> } = {};
    this.rule.walkDecls(decl => {
      const prop = postcss.vendor.unprefixed(decl.prop);
      if (!declarations[prop]) {
        declarations[prop] = [];
      }
      declarations[prop].push(decl);
    });

    const prefixRE = new RegExp(`(${Helpers.getPossiblePrefixes().join('|')})$`);
    const endsWithLetterRE = new RegExp('[a-z]$');
    for (const prop in declarations) {
      const hasMainVariant = declarations[prop].some(d => d.prop === prop);
      const prefixes = Array.from(new Set(declarations[prop].filter(d => d.prop !== prop).map(d => d.prop.replace(prop, ''))));
      const propertyCompatData = compatData.css.properties[prop];
      if (!propertyCompatData?.__compat) return;
      let values: Array<string> = [];
      let prefixedValues: Array<string> = [];
      for (const v in propertyCompatData) {
        if (!propertyCompatData[v].__compat || propertyCompatData[v].__compat.status.deprecated) {
          continue;
        }
        declarations[prop].forEach(d => {
          const pos = d.value.indexOf(v);
          const pre = d.value.substr(0, pos);
          if (pos !== -1 && !pre.match(endsWithLetterRE) && (!pre.endsWith('-') || pre.match(prefixRE))) {
            values.push(v);
            const prefix = Helpers.getPossiblePrefixes().find(p => pre.endsWith(p));
            if (prefix) {
              prefixedValues.push(`${prefix}${v}`);
            }
          }
        });
      }
      values = Array.from(new Set(values));
      prefixedValues = Array.from(new Set(prefixedValues));

      for (const browser in propertyCompatData.__compat.support) {
        const s = hasMainVariant ? Helpers.getSupportUnit(propertyCompatData.__compat.support[browser]) : {};
        let unsupportedVersions = Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
        prefixes.forEach(prefix => {
          const s = Helpers.getSupportUnit(propertyCompatData.__compat.support[browser], prefix);
          if (s.version_added) {
            const prefixedUnsupportedVersions =
              Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
            unsupportedVersions = unsupportedVersions.filter(version => prefixedUnsupportedVersions.includes(version));
          }
        });
        unsupportedVersions.forEach(version => {
          issues[browser][version].push({
            type: 'property',
            title: hasMainVariant ? prop : prefixes.map(p => `${p}${prop}`).join('/'),
            data: propertyCompatData,
            instance: {
              start: declarations[prop][0].source.start,
              end: declarations[prop][0].source.end
            },
            source: this.source.id
          });
        });
        values.forEach(value => {
          const hasMainValueVariant =
            prefixedValues.length === 0 || declarations[prop].some(d => d.value.includes(value) && !d.value.includes(`-${value}`));
          const s = hasMainValueVariant ? Helpers.getSupportUnit(propertyCompatData[value].__compat.support[browser]) : {};
          let unsupportedVersions = Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
          prefixedValues.filter(pv => pv.includes(value)).map(pv => pv.replace(value, '')).forEach(prefix => {
            const s = Helpers.getSupportUnit(propertyCompatData[value].__compat.support[browser], prefix);
            if (s.version_added) {
              const prefixedUnsupportedVersions =
                Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
              unsupportedVersions = unsupportedVersions.filter(version => prefixedUnsupportedVersions.includes(version));
            }
          });
          unsupportedVersions.forEach(version => {
            issues[browser][version].push({
              type: 'value',
              title: `${prop}: ${hasMainValueVariant ? value : prefixedValues.join('/')}`,
              data: propertyCompatData,
              instance: {
                start: declarations[prop][0].source.start,
                end: declarations[prop][0].source.end
              },
              source: this.source.id
            });
          });
        });
      }
    }
  }
}
