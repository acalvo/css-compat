<template>
  <div class="container">
    <div class="main">
      <div class="grid">
        <Browser
          v-for="(issueRangeList, browser) in issues"
          :key="browser"
          :browser="browser"
          :issueRangeList="issueRangeList"
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
import { Component, Prop, Vue } from "vue-property-decorator";
import Browser from "./Browser.vue";
import Sidebar from "./Sidebar.vue";
import { Stylesheets } from "../lib/stylesheets";
import { IssueRange } from "../lib/types";

@Component({
  components: {
    Browser,
    Sidebar
  }
})
export default class App extends Vue {
  @Prop() public stylesheets: Stylesheets;
  public issues = this.stylesheets.getIssues();
  public selectedRange: IssueRange = {} as any;

  public showInfo(range: IssueRange) {
    this.selectedRange = range;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}
.main {
  flex-grow: 1;
  padding: 20px 50px;
  border-right: 1px solid var(--separator-color);
}
.grid {
  margin: 0 auto;
  width: 600px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 10px;
  text-align: center;
}
.sidebar {
  padding: 0 50px 25px 25px;
  background: var(--background-sidebar-color);
  flex-basis: 500px;
  min-width: 500px;
}
</style>
