<template>
  <div
    v-if="isEmpty(stylesheets)"
    class="simple"
  >
    <template v-if="isEmpty(error)">
      Loading...
    </template>
    <Error
      v-else
      :error="error"
    >
    </Error>
  </div>
  <Main
    v-else
    :stylesheets="stylesheets"
  >
  </Main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Error from './components/Error.vue';
import Main from './components/Main.vue';
import { BrowserTasks } from './lib/browser-tasks';
import { Stylesheets } from './lib/stylesheets';
import { Source } from './lib/types';

@Component({
  components: {
    Main,
    Error
  }
})
export default class App extends Vue {
  public stylesheets: Stylesheets = {} as any;
  public error: any = {};

  public async mounted() {
    try {
      BrowserTasks.manageThemeColorChange();
      BrowserTasks.reloadOnNavigation();
      const sources = await BrowserTasks.getAllCssSources();
      const stylesheets = new Stylesheets();
      await Promise.all(sources.map(source => stylesheets.add(source)));
      this.stylesheets = stylesheets;
    } catch (error) {
      console.error(error);
      this.error = error;
    }

  }

  public isEmpty(obj: object) {
    return Object.keys(obj).length === 0;
  }
}
</script>

<style>
:root[data-theme="light"] {
  --default-color: #38383d;
  --background-primary-color: #ffffff;
  --background-secondary-color: #f9f9fa;
  --separator-color: #e0e0e2;
}
:root[data-theme="dark"] {
  --default-color: #b1b1b3;
  --background-primary-color: #232327;
  --background-secondary-color: #18181a;
  --separator-color: #38383d;
}
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  background: var(--separator-color);
  color: var(--default-color);
}
.simple {
  margin: 75px auto;
  width: max-content;
  font-size: 16px;
}
a {
  color: inherit;
}
</style>
