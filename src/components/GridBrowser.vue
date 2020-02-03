<template>
  <div class="browser">
    <div class="title">
      {{ browsers.get(browser).name.replace('Internet Explorer', 'IE') }}
    </div>
    <div>
      <button
        v-if="browser === 'edge'"
        style="background: royalblue"
        @click="$parent.$emit('select', { browser })"
      >
        79 - {{ latestChromeRelease }}
      </button>
      <button
        v-for="range in issueRangeList"
        :key="range.versions.first"
        :title="`${Object.keys(range.issues).length} unsupported properties`"
        :style="'background: ' + (Object.keys(range.issues).length ? `#ff${Math.ceil(99 / Object.keys(range.issues).length).toString().padStart(2, '0')}00` : 'green')"
        @click="$parent.$emit('select', range)"
      >
        {{ range.versions.first }}
        <template v-if="range.versions.last">
          - {{ range.versions.last }}
        </template>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { browsers } from '../lib/browsers';
import { IssueRange } from '../lib/types';

@Component
export default class GridBrowser extends Vue {
  @Prop() public browser: string;
  @Prop() public issueRangeList: Array<IssueRange>;
  public browsers = browsers;
  public get latestChromeRelease() {
    return Array.from(this.browsers.get('chrome').releases)[this.browsers.get('chrome').releases.size - 1][0];
  }
}
</script>

<style scoped>
.browser {
  font-size: 14px;
}
.title {
  margin-bottom: 10px;
}
button {
  color: white;
  text-shadow: 1px 1px 0 #444444;
  margin-top: 5px;
  padding: 5px;
  display: block;
  font-size: inherit;
  border: none;
  width: 100%;
  cursor: pointer;
}
</style>
