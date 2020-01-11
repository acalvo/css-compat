<template>
  <div class="simple">
    <h2>An error occurred</h2>
    <p>
      Please report it at
      <a
        href="https://github.com/acalvo/css-compat/issues"
      >https://github.com/acalvo/css-compat/issues</a>
    </p>
    <pre>{{ error.value }}</pre>
  </div>
</template>

<script>
export default {
  props: ["error"]
};
</script>
