<template>
  <div class="container">
    <Topbar @change="filter"></Topbar>
    <LeftSidebar
      :sources="sources"
      @change="filterSources"
    >
    </LeftSidebar>
    <Grid
      :issues="issues"
      @select="showInfo"
    ></Grid>
    <RightSidebar :range="selectedRange"></RightSidebar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Stylesheets } from '../lib/stylesheets';
import { GroupedIssues, IssueRange, Source, StatusFilter } from '../lib/types';
import Grid from './Grid.vue';
import LeftSidebar from './LeftSidebar.vue';
import RightSidebar from './RightSidebar.vue';
import Topbar from './Topbar.vue';

@Component({
  components: {
    Topbar,
    LeftSidebar,
    Grid,
    RightSidebar
  }
})
export default class Main extends Vue {
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
  grid-template-rows: auto 1fr;
  grid-template-columns: 300px minmax(550px, 1fr) 400px;
  grid-row-gap: 1px;
  grid-column-gap: 1px;
  height: 100vh;
}
</style>
