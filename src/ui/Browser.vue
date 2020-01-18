<template>
  <div>
    <div>{{ browsers.get(browserKey).name.replace('Internet Explorer', 'IE') }}</div>
    <div>
      <button
        v-if="browserKey === 'edge'"
        style="background: royalblue"
        @click="$emit('select', { browserKey, undefined })"
      >79 - {{ Array.from(browsers.get('chrome').releases)[browsers.get('chrome').releases.size-1][0] }}</button>
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
import { browsers } from "../lib/browsers";

export default {
  props: ["browserKey", "browserCompat"],
  data: () => ({
    browsers
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
