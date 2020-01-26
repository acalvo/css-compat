<template>
  <div class="topbar">
    <div class="about">{{ getExtensionInfo() }}</div>
    <div class="filters">
      Include CSS features that are:
      <input
        type="checkbox"
        id="experimental"
        v-model="status.experimental"
        @change="$emit('change', status)"
      />
      <label for="experimental">experimental</label>
      <input
        type="checkbox"
        id="non-standard"
        v-model="status.nonstandard"
        @change="$emit('change', status)"
      />
      <label for="non-standard">non-standard</label>
      <input
        type="checkbox"
        id="deprecated"
        v-model="status.deprecated"
        @change="$emit('change', status)"
      />
      <label for="deprecated">deprecated</label>
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

  public mounted() {
    this.$emit("change", this.status);
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
}
.topbar > div {
  padding: 3px 15px;
}
.about {
  border-right: 1px solid var(--separator-color);
  align-self: center;
}
</style>
