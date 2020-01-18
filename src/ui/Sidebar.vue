<template>
  <div v-if="browserKey === 'edge' && !range">
    <h2>{{ browsers.get(browserKey).name }} 79 - {{ Array.from(browsers.get('chrome').releases)[browsers.get('chrome').releases.size-1][0] }}</h2>
    <div class="sub">(released: January 2020 - present)</div>
    <p>Edge 79 onwards shares the same engine as Chrome. Please, see its compatibility data for this version range.</p>
  </div>
  <div v-else-if="browserKey">
    <h2>
      {{ browsers.get(browserKey).name }} {{ range.versions.first }}
      <template
        v-if="range.versions.last"
      >- {{ range.versions.last }}</template>
    </h2>
    <div class="sub">(released: {{ getReleaseDates(range.versions.first, range.versions.last) }})</div>
    <div v-if="Object.keys(range.data).length > 0">
      <p>Missing CSS features:</p>
      <ol>
        <li v-for="propArr in range.data" v-bind:key="propArr">
          <span class="property">
            <a
              v-if="propArr[0].data.__compat"
              :href="propArr[0].data.__compat.mdn_url"
            >{{ propArr[0].title }}</a>
            <template v-else>{{ propArr[0].title }}</template>
          </span>
          <span class="additional-info">
            (used
            <template v-if="propArr.length > 1">{{ propArr.length }} times</template>
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

<script>
import { browsers } from "../lib/browsers";

export default {
  props: ["browserKey", "range"],
  data: () => ({
    browsers
  }),
  methods: {
    localizeDate: function(strDate) {
      if (!strDate || new Date(strDate) > new Date()) {
        return "present";
      }
      return new Date(strDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });
    },
    getReleaseDates(v1, v2) {
      let result = this.localizeDate(
        browsers.get(this.browserKey).releases.get(v1)["release_date"]
      );
      if (v2) {
        result = `${result} - ${this.localizeDate(
          browsers.get(this.browserKey).releases.get(v2)["release_date"]
        )}`;
      }
      return result;
    }
  }
};
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
.property {
  font-size: 16px;
  font-family: Courier, "Lucida Console", monospace;
}
.additional-info {
  font-size: 12px;
}
</style>
