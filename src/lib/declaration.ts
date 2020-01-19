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

    for (const prop in declarations) {
      const hasMainVariant = declarations[prop].prefixes.has('');
      const prefixes = Array.from(declarations[prop].prefixes.values()).filter(p => p);
      const propertyCompatData = compatData.css.properties[prop];
      const values: { [key: string]: Set<string> } = {};
      declarations[prop].instances.forEach(d => {
        const match = Match.value(d.value, prop);
        if (!match.value) {
          return;
        }
        if (!values[match.value]) {
          values[match.value] = new Set();
        }
        values[match.value].add(match.prefix);
      });

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
        Object.keys(values).forEach(value => {
          const s = values[value].has('') ? Helpers.getSupportUnit(propertyCompatData[value].__compat.support[browser]) : {};
          let unsupportedVersions = Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
          const prefixes = Array.from(values[value].values()).filter(p => p);
          prefixes.forEach(prefix => {
            const s = Helpers.getSupportUnit(propertyCompatData[value].__compat.support[browser], prefix);
            if (s.version_added) {
              const prefixedUnsupportedVersions =
                Helpers.getUnsupportedVersions(browser as BrowserKey, s.version_added, s.version_removed);
              unsupportedVersions = unsupportedVersions.filter(version => prefixedUnsupportedVersions.includes(version));
            }
          });
          unsupportedVersions.forEach(version => {
            const title = `${prop}: ${values[value].has('') ? value : prefixes.map(p => `${p}${value}`).join('/')}`;
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
