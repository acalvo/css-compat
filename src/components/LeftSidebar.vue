<template>
  <div class="sidebar">
    <label
      v-for="source in sources"
      :key="source.id"
    >
      <input
        v-model="selectedSources"
        :value="source"
        type="checkbox"
        @change="$emit('change', selectedSources)"
      >
      <div class="name">{{ source.id }}</div>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Source } from '../lib/types';

@Component
export default class LeftSidebar extends Vue {
  @Prop() public sources: Array<Source>;
  public selectedSources = this.sources;
}
</script>

<style scoped>
.sidebar {
  padding-right: 25px;
  padding-left: 10px;
  overflow: auto;
  background: var(--background-secondary-color);
}
label {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--separator-color);
}
label:last-child {
  border-bottom: none;
}
.name {
  margin-left: 10px;
  overflow-wrap: anywhere;
}
</style>
