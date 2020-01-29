<template>
  <div class="topbar">
    <div class="about">{{ getExtensionInfo() }}</div>
    <div>
      Include CSS features that are:
      <input
        type="checkbox"
        id="experimental"
        v-model="status.experimental"
        @change="$emit('change', { status, year })"
      />
      <label for="experimental">experimental</label>
      <input
        type="checkbox"
        id="non-standard"
        v-model="status.nonstandard"
        @change="$emit('change', { status, year })"
      />
      <label for="non-standard">non-standard</label>
      <input
        type="checkbox"
        id="deprecated"
        v-model="status.deprecated"
        @change="$emit('change', { status, year })"
      />
      <label for="deprecated">deprecated</label>
    </div>
    <div>
      <label for="browsers">Show only browsers from:</label>
      <select
        name="browsers"
        id="browsers"
        v-model="year"
        @change="$emit('change', { status, year })"
      >
        <option value>Anytime</option>
        <option value="2019">2019+</option>
        <option value="2018">2018+</option>
        <option value="2017">2017+</option>
        <option value="2016">2016+</option>
        <option value="2015">2015+</option>
        <option value="2013">2013+</option>
        <option value="2009">2009+</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import browser from "webextension-polyfill";

@Component
export default class Topbar extends Vue {
  public status = {
    experimental: true,
    nonstandard: true,
    deprecated: true
  };
  public year = "";

  public mounted() {
    this.$emit("change", { status: this.status, year: this.year });
  }

  public getExtensionInfo() {
    const manifest = browser.runtime.getManifest();
    return `${manifest.name} ${manifest.version}`;
  }
}
</script>

<style scoped>
.topbar {
  grid-column: 1 / 3;
  background: var(--background-secondary-color);
  font-size: 12px;
  display: flex;
  align-items: baseline;
}
.topbar > div {
  padding: 3px 15px;
}
.about {
  border-right: 1px solid var(--separator-color);
  align-self: center;
}
label {
  margin-right: 5px;
}
</style>
