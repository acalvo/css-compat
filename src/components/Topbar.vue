<template>
  <div class="topbar">
    <div class="about">
      {{ getExtensionInfo() }}
    </div>
    <div>
      Include CSS features that are:
      <label
        v-for="s in statuses"
        :key="s"
      >
        <input
          v-model="status[s]"
          type="checkbox"
          @change="$emit('change', { status, year })"
        >
        {{ s }}
      </label>
    </div>
    <div>
      <label for="browsers">Show only browsers from:</label>
      <select
        id="browsers"
        v-model="year"
        name="browsers"
        @change="$emit('change', { status, year })"
      >
        <option value>
          Anytime
        </option>
        <option
          v-for="year in years"
          :key="year"
          :value="year"
        >
          {{ year }}+
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Topbar extends Vue {
  public years = ['2019', '2018', '2017', '2016', '2015', '2013', '2009'];
  public statuses = ['experimental', 'nonstandard', 'deprecated'];
  public status = {
    experimental: true,
    nonstandard: true,
    deprecated: true
  };
  public year = '';

  public mounted() {
    this.$emit('change', { status: this.status, year: this.year });
  }

  public getExtensionInfo() {
    const manifest = window.chrome.runtime.getManifest();
    return `${manifest.name} ${manifest.version}`;
  }
}
</script>

<style scoped>
.topbar {
  display: flex;
  grid-column: 1 / 4;
  align-items: baseline;
  background: var(--background-secondary-color);
}
.topbar > div {
  padding: 3px 15px;
}
.about {
  align-self: center;
  border-right: 1px solid var(--separator-color);
}
label {
  margin-right: 5px;
}
</style>
