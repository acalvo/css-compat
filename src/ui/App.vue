<template>
  <div class="container">
    <div class="main">
      <div class="grid">
        <Browser
          v-for="(browserCompat, browserKey) in compat"
          :key="browserKey"
          :browserKey="browserKey"
          :browserCompat="browserCompat"
          @select="showInfo"
        ></Browser>
      </div>
    </div>
    <div class="sidebar">
      <Sidebar :browserKey="selectedBrowserKey" :range="selectedRange"></Sidebar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Browser from "./Browser.vue";
import Sidebar from "./Sidebar.vue";

@Component({
  components: {
    Browser,
    Sidebar
  }
})
export default class App extends Vue {
  @Prop() public compat: any;
  public selectedBrowserKey: string;
  public selectedRange: any = {};

  public showInfo(value: { browserKey: string; range: any }) {
    this.selectedBrowserKey = value.browserKey;
    this.selectedRange = value.range;
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
