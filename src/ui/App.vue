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

<script>
import Browser from "./Browser.vue";
import Sidebar from "./Sidebar.vue";

export default {
  props: ["compat"],
  components: {
    Browser,
    Sidebar
  },
  data: () => ({
    selectedBrowserKey: undefined,
    selectedRange: {}
  }),
  methods: {
    showInfo: function(value) {
      this.selectedBrowserKey = value.browserKey;
      this.selectedRange = value.range;
    }
  }
};
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
