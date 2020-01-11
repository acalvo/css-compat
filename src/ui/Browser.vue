<template>
  <div>
    <div>{{ browsersMap.get(browserKey).name.replace('Internet Explorer', 'IE') }}</div>
    <div>
      <button
        v-for="range in browserCompat"
        :key="range"
        :title="`${Object.keys(range.data).length} unsupported properties`"
        :style="'background: ' + (Object.keys(range.data).length ? `#ff${Math.ceil(99 / Object.keys(range.data).length).toString().padStart(2, '0')}00` : 'green')"
        @click="$emit('select', { browserKey, range })"
      >
        {{ range.versions.first }}
        <template v-if="range.versions.last">- {{ range.versions.last }}</template>
      </button>
    </div>
  </div>
</template>

<script>
import { browsersMap } from "../lib/browsers";

export default {
  props: ["browserKey", "browserCompat"],
  data: () => ({
    browsersMap
  })
};
</script>

<style scoped>
button {
  color: white;
  text-shadow: 1px 1px 0 #444444;
  margin-top: 5px;
  padding: 5px;
  display: block;
  font-size: inherit;
  border: none;
  width: 100%;
  cursor: pointer;
}
</style>
