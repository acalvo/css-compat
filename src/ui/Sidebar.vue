<template>
  <div v-if="range.browser === 'edge' && !range.issues">
    <h2>{{ browsers.get(range.browser).name }} 79 - {{ Array.from(browsers.get('chrome').releases)[browsers.get('chrome').releases.size-1][0] }}</h2>
    <div class="sub">
      (released: January 2020 - present)
    </div>
    <p>Edge 79 onwards shares the same engine as Chrome. Please, see its compatibility data for this version range.</p>
  </div>
  <div v-else-if="range.browser">
    <h2>
      {{ browsers.get(range.browser).name }} {{ range.versions.first }}
      <template v-if="range.versions.last">
        - {{ range.versions.last }}
      </template>
    </h2>
    <div class="sub">
      (released: {{ getReleaseDates(range.versions.first, range.versions.last) }})
    </div>
    <div v-if="Object.keys(range.issues).length > 0">
      <p>Missing CSS features:</p>
      <ol>
        <li
          v-for="prop in range.issues"
          :key="prop"
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
    <div v-else>
      <p>All the CSS seems to be supported in this browser. Don't forget to try it out, though!</p>
    </div>
  </div>
  <div v-else>
    <h2>Heads up!</h2>
    <p>
      This tool doesn't intent to replace real cross-browser testing;
      it's just another handy resource to quickly detect possible incompatibilities.
      It might happen that a browser supports all the CSS statements but it renders incorrectly,
      or the other way round: there might be unsupported CSS statements that don't affect the final result.
    </p>
    <p>Click on a browser version to see its issues.</p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { browsers } from '../lib/browsers';
import { IssueRange } from '../lib/types';

@Component
export default class Sidebar extends Vue {
  @Prop() public range: IssueRange;
  public browsers = browsers;

  public localizeDate(strDate: string): string {
    if (!strDate || new Date(strDate) > new Date()) {
      return 'present';
    }
    return new Date(strDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
  public getReleaseDates(v1: string, v2: string): string {
    let result = this.localizeDate(
      browsers.get(this.range.browser).releases.get(v1)['release_date']
    );
    if (v2) {
      result = `${result} - ${this.localizeDate(
        browsers.get(this.range.browser).releases.get(v2)['release_date']
      )}`;
    }
    return result;
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 0;
}
.sub {
  font-size: 14px;
}
li {
  margin: 8px 0;
  font-size: 14px;
}
.icon {
  height: 12px;
  width: 12px;
  content: "";
  display: inline-block;
  margin-left: 3px;
  vertical-align: middle;
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
  font-size: 16px;
  font-family: Courier, "Lucida Console", monospace;
}
.additional-info {
  font-size: 12px;
  margin-left: 3px;
}
</style>
