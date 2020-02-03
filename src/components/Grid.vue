<template>
  <div class="main">
    <div class="grid">
      <GridBrowser
        v-for="(issueRangeList, browser) in issues"
        :key="browser"
        :browser="browser"
        :issue-range-list="issueRangeList"
      ></GridBrowser>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Stylesheets } from '../lib/stylesheets';
import { GroupedIssues, IssueRange, Source, StatusFilter } from '../lib/types';
import GridBrowser from './GridBrowser.vue';

@Component({
  components: {
    GridBrowser
  }
})
export default class Grid extends Vue {
  @Prop() public issues: GroupedIssues;
}
</script>

<style scoped>
.main {
  background: var(--background-primary-color);
  overflow: auto;
}
.grid {
  margin: 15px auto;
  max-width: 550px;
  min-width: 500px;
  width: calc(100% - 50px);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 10px;
  text-align: center;
}
</style>
