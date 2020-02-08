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
import { GroupedIssues } from '../lib/types';
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
  overflow: auto;
  background: var(--background-primary-color);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 10px;
  width: calc(100% - 50px);
  min-width: 500px;
  max-width: 550px;
  margin: 15px auto;
  text-align: center;
}
</style>
