<template>
  <div class="container">
    <div class="main">
      <div class="grid">
        <div v-for="browserData in browsersData" v-bind:key="browserData">
          <div class="title">{{ browserData[1].name.replace('Internet Explorer', 'IE') }}</div>
          <div class="versions">
            <button
              v-for="range in compat[browserData[0]]"
              v-bind:key="range"
              v-on:click="showInfo(browserData[1], range.data, range.versions)"
              :title="`${Object.keys(range.data).length} unsupported properties`"
              v-bind:style="Object.keys(range.data).length ? `background: #ff${Math.ceil(99 / Object.keys(range.data).length).toString().padStart(2, '0')}00` : 'background: green' "
            >
              {{ range.versions[0] }}
              <template
                v-if="range.versions.length > 1"
              >- {{ range.versions[range.versions.length - 1] }}</template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="sidebar">
      <div v-if="unsupportedData">
        <h2>
          {{ browserData.name }} {{ versions[0] }}
          <template
            v-if="versions.length > 1"
          >- {{ versions[versions.length - 1] }}</template>
        </h2>
        <div class="sub">
          (released: {{ localizeDate(browserData.releases.get(versions[0])['release_date']) }}
          <template
            v-if="versions.length > 1"
          >- {{ localizeDate(browserData.releases.get(versions[versions.length - 1])['release_date']) }}</template>)
        </div>
        <div v-if="Object.keys(unsupportedData).length > 0">
          <p>Missing CSS features:</p>
          <ol>
            <li v-for="propArr in unsupportedData" v-bind:key="propArr">
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
          This tool doesn't intent to replace real cross-browser testing; it's just another handy resource to quickly detect possible incompatibilities.
          It might happen that a browser supports all the CSS statements but it renders incorrectly, or the other way round: there might be unsupported CSS statements that don't affect the final result.
        </p>
        <p>Click on a browser version to see its issues.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["compat", "browsersData"],
  data: () => ({
    unsupportedData: undefined,
    browserData: {},
    versions: []
  }),
  methods: {
    showInfo: function(browserData, unsupportedData, versions) {
      this.browserData = browserData;
      this.unsupportedData = unsupportedData;
      this.versions = versions;
    },
    localizeDate: function(strDate) {
      if (!strDate || new Date(strDate) > new Date()) {
        return "present";
      }
      return new Date(strDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long"
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}
.main {
  flex-grow: 1;
  padding: 20px 50px;
  border-right: 1px solid var(--separator-color);
}
.grid {
  margin: 0 auto;
  width: 600px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 10px;
  text-align: center;
}
.versions > button {
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
.sidebar {
  padding: 0 50px 25px 25px;
  background: var(--background-sidebar-color);
  flex-basis: 500px;
  min-width: 500px;
}
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
li .property {
  font-size: 16px;
  font-family: Courier, "Lucida Console", monospace;
}
li .additional-info {
  font-size: 12px;
}
</style>
