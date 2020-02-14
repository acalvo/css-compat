<template>
  <div v-if="issues.length > 0">
    <p>Missing {{ type }}:</p>
    <ol>
      <li
        v-for="prop in issues"
        :key="prop.title"
      >
        <span class="property">
          <a
            v-if="prop.data.__compat"
            :href="prop.data.__compat.mdn_url"
            v-html="prop.title"
          ></a>
          <template
            v-else
            v-html="prop.title"
          ></template>
        </span>
        <span
          v-if="prop.data.__compat.status.experimental"
          class="icon experimental"
          title="experimental feature"
        ></span>
        <span
          v-if="!prop.data.__compat.status.standard_track"
          class="icon non-standard"
          title="non-standard feature"
        ></span>
        <span
          v-if="prop.data.__compat.status.deprecated"
          class="icon deprecated"
          title="deprecated feature"
        ></span>
        <span class="additional-info">
          (used
          <template v-if="prop.instances.length > 1">{{ prop.instances.length }} times</template>
          <template v-else>once</template>)
        </span>
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Issue } from '../lib/types';

@Component
export default class RightSidebarIssues extends Vue {
  @Prop() public issues: Array<Issue>;
  @Prop() public type: string;
}
</script>

<style scoped>
ol {
  padding-left: 2.5em;
  margin-bottom: 1.5em;
}
li {
  margin: 8px 0;
}
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 3px;
  vertical-align: middle;
  content: "";
}
.experimental {
  background-color: darkseagreen;
  mask: url(images/icon-experimental.svg);
  mask-size: cover;
}
.non-standard {
  background-color: crimson;
  mask: url(images/icon-nonstandard.svg);
  mask-size: cover;
}
.deprecated {
  background-color: crimson;
  mask: url(images/icon-deprecated.svg);
  mask-size: cover;
}
.property {
  font-family: Courier, "Lucida Console", monospace;
  font-size: 13px;
}
.additional-info {
  margin-left: 3px;
}
</style>
