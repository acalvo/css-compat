import { Match } from './match';
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
    const declarations: { [key: string]: { prefixes: Set<string>; instances: Array<postcss.Declaration> } } = {};
    this.rule.walkDecls(decl => {
      const match = Match.property(decl.prop);
      if (!match.property) {
        return;
      }
      if (!declarations[match.property]) {
        declarations[match.property] = {
          prefixes: new Set(),
          instances: []
        };
      }
      declarations[match.property].prefixes.add(match.prefix);
      declarations[match.property].instances.push(decl);
    });

    const prefixRE = new RegExp(`(${Helpers.getPossiblePrefixes().join('|')})$`);
    const endsWithLetterRE = new RegExp('[a-z]$');
    for (const prop in declarations) {
      const hasMainVariant = declarations[prop].prefixes.has('');
      const prefixes = Array.from(declarations[prop].prefixes.values()).filter(p => p);
      const propertyCompatData = compatData.css.properties[prop];
      let values: Array<string> = [];
      let prefixedValues: Array<string> = [];
      for (const v in propertyCompatData) {
        if (!propertyCompatData[v].__compat || propertyCompatData[v].__compat.status.deprecated) {
          continue;
        }
        declarations[prop].instances.forEach(d => {
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
          const title = hasMainVariant ? prop : prefixes.map(p => `${p}${prop}`).join('/');
          if (!issues[browser][version][title]) {
            issues[browser][version][title] = {
              type: 'property',
              title: title,
              data: propertyCompatData,
              instances: []
            };
          }
          issues[browser][version][title].instances.push({
            source: this.source.id,
            start: declarations[prop].instances[0].source.start,
            end: declarations[prop].instances[0].source.end
          });
        });
        values.forEach(value => {
          const hasMainValueVariant = prefixedValues.length === 0
            || declarations[prop].instances.some(d => d.value.includes(value) && !d.value.includes(`-${value}`));
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
            const title = `${prop}: ${hasMainValueVariant ? value : prefixedValues.join('/')}`;
            if (!issues[browser][version][title]) {
              issues[browser][version][title] = {
                type: 'value',
                title: title,
                data: propertyCompatData,
                instances: []
              };
            }
            issues[browser][version][title].instances.push({
              source: this.source.id,
              start: declarations[prop].instances[0].source.start,
              end: declarations[prop].instances[0].source.end
            });
          });
        });
      }
    }
  }
}
