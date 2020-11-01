import { Declaration as PostCSSDeclaration, Rule as PostCSSRule } from 'postcss';
import compatData from './data.json';
import { Helpers } from './helpers';
import { Match } from './match';
import { BrowserKey, Issues } from './types';

export class Declaration {

  constructor(private rule: PostCSSRule) {
  }

  public process(issues: Issues) {
    const declarations: { [key: string]: { prefixes: Set<string>; instances: Array<PostCSSDeclaration> } } = {};
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
        const propertyTitle = hasMainVariant ? prop : prefixes.map(p => `${p}${prop}`).join('/');
        unsupportedVersions.forEach(version => {
          if (!issues[browser][version][propertyTitle]) {
            issues[browser][version][propertyTitle] = {
              type: 'property',
              title: propertyTitle,
              data: propertyCompatData,
              instances: []
            };
          }
          issues[browser][version][propertyTitle].instances.push({
            source: Helpers.getSourceIndex(declarations[prop].instances[0].source.input.id),
            start: declarations[prop].instances[0].source.start,
            end: declarations[prop].instances[0].source.end
          });
        });
        for (const value in values) {
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
          const valueTitle = `${prop}: ${values[value].has('') ? value : prefixes.map(p => `${p}${value}`).join('/')}`;
          unsupportedVersions.forEach(version => {
            if (issues[browser][version][propertyTitle]) {
              return;
            }
            if (!issues[browser][version][valueTitle]) {
              issues[browser][version][valueTitle] = {
                type: 'value',
                title: valueTitle,
                data: propertyCompatData,
                instances: []
              };
            }
            issues[browser][version][valueTitle].instances.push({
              source: Helpers.getSourceIndex(declarations[prop].instances[0].source.input.id),
              start: declarations[prop].instances[0].source.start,
              end: declarations[prop].instances[0].source.end
            });
          });
        }
      }
    }
  }
}
