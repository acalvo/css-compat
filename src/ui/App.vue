<template>
  <div class="container">
    <Topbar @change="filter"></Topbar>
    <LeftSidebar
      :sources="sources"
      @change="filterSources"
    >
    </LeftSidebar>
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
    <RightSidebar :range="selectedRange"></RightSidebar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Topbar from './Topbar.vue';
import LeftSidebar from './LeftSidebar.vue';
import Browser from './Browser.vue';
import RightSidebar from './RightSidebar.vue';
import { Stylesheets } from '../lib/stylesheets';
import { GroupedIssues, IssueRange, Source, StatusFilter } from '../lib/types';

@Component({
  components: {
    Topbar,
    LeftSidebar,
    Browser,
    RightSidebar
  }
})
export default class App extends Vue {
  @Prop() public stylesheets: Stylesheets;
  public sources = this.stylesheets.getSources();
  public issues: GroupedIssues = {};
  public selectedRange: IssueRange = {} as any;
  public selectedStatus: StatusFilter = {} as any;
  public selectedYear = '';
  public selectedSources = this.sources;

  public showInfo(range: IssueRange) {
    this.selectedRange = range;
  }

  public filter(data: { status: StatusFilter; year: string }) {
    this.selectedStatus = data.status;
    this.selectedYear = data.year;
    this.updateIssues();
  }

  public filterSources(sources: Array<Source>) {
    this.selectedSources = sources;
    this.updateIssues();
  }

  private updateIssues() {
    this.selectedRange = {} as any;
    this.issues = this.stylesheets.getIssues(this.selectedSources, this.selectedStatus, this.selectedYear);
  }
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 300px minmax(550px, 1fr) 400px;
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
