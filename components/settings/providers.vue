<template>
  <div>
    <h1>Torznab Provider</h1>
    <el-form label-width="80px">
    <h3>Remote details</h3>
      <p>Where is located your torznab API ?</p>
      <el-form-item label="Url">
        <el-input v-model="url"></el-input>
      </el-form-item>

      <el-form-item label="Api key">
        <el-input v-model="apiKey"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="test" type="success">Test</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {

  computed: {
    url: {
      get() {
        return this.$store.state.settings.provider.url;
      },
      set(url) {
        this.$store.commit('setSettingsProviderUrl', url);
      }
    },

    apiKey: {
      get() {
        return this.$store.state.settings.provider.apiKey;
      },
      set(apiKey) {
        this.$store.commit('setSettingsProviderApiKey', apiKey);
      }
    }
  },

  methods: {
    async test() {
      if (!this.url || !this.apiKey) {
        this.$notify.error({
          title: "Error",
          message: "Missing a required field"
        });
        return;
      }
      try {
        // fucking cors strike again
        let res = await this.$axios.$post("/api/test_torznab", {
          url: this.url,
          apiKey: this.apiKey
        });

        if (!res.success) {
          this.$notify.error({
            title: "Error",
            message: res.error
          });
          this.$store.commit('appendLog', {
            level: 'ERROR',
            log: 'Torznab test failed.'
          })
        } else {
          this.$notify.success({
            title: 'Success',
            message: 'Torznab provider working !'
          })
          this.$store.commit('appendLog', {
            level: 'INFO',
            log: 'Torznab test succeded.'
          })
        }


      } catch (e) {
        this.$notify.error({
          title: "Error",
          message: e
        });
      }
    }
  }
};
</script>

<style scoped>
h1 {
  margin-top: 20px;
}

h3 {
  margin-top: 50px;
}

.el-form-item {
  margin-top: 20px;
}

.el-input {
  max-width: 400px;
}
</style>