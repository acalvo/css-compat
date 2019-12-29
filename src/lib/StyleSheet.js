const AtRule = require('./AtRule')
const cssBeautify = require('cssbeautify')
const Declaration = require('./Declaration')
const { browsersMap } = require('./browsers')
const postcss = require('postcss')
const Selector = require('./Selector')

const StyleSheet = function () {
  this.issues = {}
  this.sources = []

  Array.from(browsersMap.keys()).forEach(browser => {
    this.issues[browser] = {}

    Array.from(browsersMap.get(browser).releases.keys()).forEach(version => {
      this.issues[browser][version] = []
    })
  })
}

StyleSheet.prototype.add = function ({ id, content, external }) {
  this.sources.push({
    id,
    content,
    external
  })
}

StyleSheet.prototype.groupIssues = function (issues, property) {
  let groupedIssues = {}

  Object.keys(issues).forEach(browser => {
    groupedIssues[browser] = groupedIssues[browser] || {}

    Object.keys(issues[browser]).forEach(version => {
      groupedIssues[browser][version] = issues[browser][version].reduce((issues, issue) => {
        const key = issue[property]

        issues[key] = issues[key] || []
        issues[key].push(issue)

        return issues
      }, {})
    })
  })

  return groupedIssues
}

StyleSheet.prototype.parse = function () {
  let failedSources = []
  let processedSources = {}

  const queue = this.sources.map(source => {
    const plugin = postcss.plugin('postcss-css-report', this.process.bind(this, source))
    const formattedCss = cssBeautify(source.content)

    return postcss([plugin])
      .process(formattedCss, { from: undefined })
      .then(result => {
        processedSources[source.id] = result.css

        return result
      })
      .catch(err => {
        console.log('** CSS parse error:', err)

        failedSources.push(source.id)
      })
  })

  return Promise.all(queue).then(stylesheets => {
    return {
      data: this.groupIssues(this.issues, 'title'),
      failedSources,
      stylesheets: processedSources,
      allSources: this.sources
    }
  })
}

StyleSheet.prototype.process = function (source, opts = {}) {
  return (css, result) => {
    css.walkRules(this.processRule.bind(this, source))
    css.walkAtRules(this.processAtRule.bind(this, source))
  }
}

StyleSheet.prototype.processAtRule = function (source, node) {
  const atRule = new AtRule(node, source)

  atRule.process(this.issues)
}

StyleSheet.prototype.processRule = function (source, rule) {
  let ruleCache = {}

  // Process selector
  if (rule.selector) {
    const selector = new Selector(
      rule.selector,
      source,
      rule
    )

    selector.process(this.issues)
  }

  // Process declarations
  rule.walkDecls(declarationNode => {
    const declaration = new Declaration(
      declarationNode,
      source,
      rule,
      ruleCache
    )

    declaration.process(this.issues)
  })
}

module.exports = StyleSheet
