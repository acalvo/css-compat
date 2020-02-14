<template>
  <div class="sidebar">
    <div v-if="range.browser === 'edge' && !range.issues">
      <h2>{{ browsers.get(range.browser).name }} 79 - {{ Array.from(browsers.get('chrome').releases)[browsers.get('chrome').releases.size-1][0] }}</h2>
      <div class="release-date">
        (released: January 2020 - present)
      </div>
      <p>Edge 79 onwards shares the same engine as Chrome. Please, see its compatibility data for this version range.</p>
    </div>
    <div v-else-if="range.browser">
      <h2>
        {{ browsers.get(range.browser).name }} {{ range.versions.first }}
        <template v-if="range.versions.last">
          - {{ range.versions.last }}
        </template>
      </h2>
      <div class="release-date">
        (released: {{ getReleaseDates(range.versions.first, range.versions.last) }})
      </div>
      <template v-if="Object.keys(range.issues).length > 0">
        <RightSidebarIssues
          type="selectors"
          :issues="Object.values(range.issues).filter(i => i.type === 'selector')"
        >
        </RightSidebarIssues>
        <RightSidebarIssues
          type="at rules"
          :issues="Object.values(range.issues).filter(i => i.type === 'at-rule')"
        >
        </RightSidebarIssues>
        <RightSidebarIssues
          type="properties"
          :issues="Object.values(range.issues).filter(i => i.type === 'property' || i.type === 'value')"
        >
        </RightSidebarIssues>
      </template>
      <div v-else>
        <p>All the CSS seems to be supported in this browser. Don't forget to try it out, though!</p>
      </div>
    </div>
    <div v-else>
      <h2>Heads up!</h2>
      <p>
        This tool doesn't intent to replace real cross-browser testing;
        it's just another handy resource to quickly detect possible incompatibilities.
        It might happen that a browser supports all the CSS statements but it renders incorrectly,
        or the other way round: there might be unsupported CSS statements that don't affect the final result.
      </p>
      <p>Click on a browser version to see its issues.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { browsers } from '../lib/browsers';
import { IssueRange } from '../lib/types';
import RightSidebarIssues from './RightSidebarIssues.vue';

@Component({
  components: {
    RightSidebarIssues
  }
})
export default class RightSidebar extends Vue {
  @Prop() public range: IssueRange;
  public browsers = browsers;

  public localizeDate(strDate: string): string {
    if (!strDate || new Date(strDate) > new Date()) {
      return 'present';
    }
    return new Date(strDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  public getReleaseDates(v1: string, v2: string): string {
    let result = this.localizeDate(
      browsers.get(this.range.browser).releases.get(v1)['release_date']
    );
    if (v2) {
      result = `${result} - ${this.localizeDate(
        browsers.get(this.range.browser).releases.get(v2)['release_date']
      )}`;
    }
    return result;
  }
}
</script>

<style scoped>
.sidebar {
  padding: 0 25px 25px 25px;
  overflow: auto;
  background: var(--background-secondary-color);
}
h2 {
  margin-bottom: 0;
}
.release-date {
  margin-bottom: 1.5em;
}
p {
  line-height: 1.4em;
}
</style>
