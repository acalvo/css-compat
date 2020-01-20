import { Issues, Source } from './types';
import { AtRule } from './at-rule';
import { Declaration } from './declaration';
import { browsers } from './browsers';
import postcss from 'postcss';
import { Selector } from './selector';

export class Stylesheet {
  issues: Issues = {}
  sources: Array<Source> = []

  constructor() {
    Array.from(browsers.keys()).forEach(browser => {
      this.issues[browser] = {};

      Array.from(browsers.get(browser).releases.keys()).forEach(version => {
        this.issues[browser][version] = {};
      });
    });
  }

  public add(source: Source) {
    this.sources.push(source);
  }

  public parse() {
    const failedSources = [];
    const processedSources = {};

    const queue = this.sources.map(source => {
      const plugin = postcss.plugin('postcss-css-report', (opts) => (css, result) => {
        css.walkRules((rule) => this.processRule(source, rule));
        css.walkAtRules((node) => this.processAtRule(source, node));
      });

      return postcss([plugin])
        .process(source.content, { from: undefined })
        .then(result => {
          processedSources[source.id] = result.css;

          return result;
        })
        .catch(err => {
          console.log('** CSS parse error:', err);

          failedSources.push(source.id);
        });
    });

    return Promise.all(queue).then(stylesheets => {
      const compat = {};
      for (const browser in this.issues) {
        compat[browser] = [];
        const releases = browsers.get(browser).releases.entries();
        let result = releases.next();
        while (!result.done) {
          const releaseData = this.issues[browser][result.value[0]];
          if (compat[browser].length === 0
            || Object.keys(compat[browser][0].data).length !== Object.keys(releaseData).length
            || Object.keys(releaseData).length !== (new Set(Object.keys(compat[browser][0].data).concat(Object.keys(releaseData)))).size) {
            compat[browser].unshift({
              versions: {
                first: result.value[0]
              },
              data: releaseData
            });
          } else {
            compat[browser][0].versions.last = result.value[0];
          }
          result = releases.next();
        }
      }
      return compat;
    });
  }

  private processAtRule(source: Source, node: postcss.AtRule) {
    const atRule = new AtRule(node, source);
    atRule.process(this.issues);
  }

  private processRule(source: Source, rule: postcss.Rule) {
    // Process selector
    if (rule.selector) {
      const selector = new Selector(
        rule,
        source
      );

      selector.process(this.issues);
    }

    // Process declarations
    const declaration = new Declaration(
      rule,
      source
    );

    declaration.process(this.issues);
  }
}
