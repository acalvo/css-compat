<template>
  <div class="container">
    <Topbar @change="filter"></Topbar>
    <div class="main">
      <div class="grid">
        <Browser
          v-for="(issueRangeList, browser) in issues"
          :key="browser"
          :browser="browser"
          :issue-range-list="issueRangeList"
          @select="showInfo"
        ></Browser>
      </div>
    </div>
    <div class="sidebar">
      <Sidebar :range="selectedRange"></Sidebar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Topbar from './Topbar.vue';
import Browser from './Browser.vue';
import Sidebar from './Sidebar.vue';
import { Stylesheets } from '../lib/stylesheets';
import { GroupedIssues, IssueRange, StatusFilter } from '../lib/types';

@Component({
  components: {
    Topbar,
    Browser,
    Sidebar
  }
})
export default class App extends Vue {
  @Prop() public stylesheets: Stylesheets;
  public issues: GroupedIssues = {};
  public selectedRange: IssueRange = {} as any;

  public showInfo(range: IssueRange) {
    this.selectedRange = range;
  }

  public filter(data: { status: StatusFilter; year: string }) {
    this.selectedRange = {} as any;
    this.issues = this.stylesheets.getIssues(data.status, data.year);
  }
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: minmax(700px, 1fr) 500px;
  grid-template-rows: auto 1fr;
  grid-column-gap: 1px;
  grid-row-gap: 1px;
  height: 100vh;
}
.main {
  background: var(--background-primary-color);
  overflow: auto;
}
.grid {
  margin: 20px auto;
  width: 600px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 10px;
  text-align: center;
}
.sidebar {
  padding: 0 50px 25px 25px;
  background: var(--background-secondary-color);
  overflow: auto;
}
</style>
