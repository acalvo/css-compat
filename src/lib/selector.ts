import { Match } from './match';
import { BrowserKey, Issues, Source } from './types';
import compatData from './data.json';
import { Helpers } from './helpers';
import postcssSelectorParser from 'postcss-selector-parser';
import postcss from 'postcss';

export class Selector {
  constructor(private rule: postcss.Rule) {
  }

  public process(issues: Issues) {
    postcssSelectorParser(selectors => {
      selectors.walk(s => {
        let selector = '';
        switch (s.type) {
          case 'pseudo':
          case 'combinator':
            selector = Match.selector(s.value);
            break;
          case 'attribute':
            selector = 'attribute';
            if (s.insensitive) {
              selector = 'attribute/case_insensitive_modifier';
            }
            if (['s', 'S'].includes((s.raws as any).insensitiveFlag)) {
              selector = 'attribute/case_sensitive_modifier';
            }
            break;
        }
        const [mainKey, subKey] = selector.split('/');
        const mainSelectorData = compatData.css.selectors[mainKey];
        const selectorData = (!subKey) ? mainSelectorData : compatData.css.selectors[mainKey][subKey];
        if (!selector || !selectorData) {
          return;
        }
        for (const browser in selectorData.__compat.support) {
          const support = Helpers.getSupportUnit(selectorData.__compat.support[browser]);
          const unsupportedVersions =
            Helpers.getUnsupportedVersions(browser as BrowserKey, support.version_added, support.version_removed);
          unsupportedVersions.forEach(version => {
            if (!issues[browser][version][selector]) {
              issues[browser][version][selector] = {
                type: 'selector',
                title: selectorData.__compat.description,
                data: mainSelectorData,
                instances: []
              };
            }
            issues[browser][version][selector].instances.push({
              source: Helpers.getSourceIndex(this.rule.source.input.id),
              start: this.rule.source.start,
              end: this.rule.source.end
            });
          });
        }
      });
    }).processSync(this.rule.selector);
  }

}
