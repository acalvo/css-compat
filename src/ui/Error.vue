<template>
  <div class="simple">
    <h2>An error occurred</h2>
    <template v-if="error.code === 'E_PROTOCOLERROR'">
      <p>This is a restricted webpage, for security reasons extensions cannot be executed in it.</p>
    </template>
    <template v-else>
      <p>
        Please report it at
        <a
          href="https://github.com/acalvo/css-compat/issues"
        >https://github.com/acalvo/css-compat/issues</a>
      </p>
      <pre>{{ error.value }}</pre>
    </template>
  </div>
</template>

<script>
export default {
  props: ["error"]
};
</script>
