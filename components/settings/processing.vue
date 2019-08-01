<template>
  <div>
    <h1>Calibre</h1>
    <el-form label-width="230px">
      <el-form-item label="Add downloaded books to calibre">
        <el-switch v-model="calibre"></el-switch>
      </el-form-item>
    </el-form>

    <el-form label-width="80px" :disabled="!calibre">
      <h3>Online library url</h3>
      <p>Required. Url of your calibre library.</p>
      <p>Example: <code>http://mywebsite.com:8080/#books</code></p>
      <p>Add your calibre library name after the pound sign, as specified in the example.</p>

      <el-form-item label="Url">
        <el-input v-model="url"></el-input>
      </el-form-item>

      <h3>Credentials</h3>
      <p>Fill this if calibre-server is password-protected.</p>

      <el-form-item label="Username">
        <el-input v-model="username"></el-input>
      </el-form-item>

      <el-form-item label="Password">
        <el-input show-password v-model="password"></el-input>
      </el-form-item>
      <p>
        <em>
          Passwords are stored in your settings.json file and aren't encrypted.
          <br />Make sure to restrict the access to this file.
        </em>
      </p>
    </el-form>
  </div>
</template>
<script>
export default {
  computed: {
    calibre: {
      get() {
        return this.$store.state.settings.processing.calibre;
      },

      set(calibre) {
        this.$store.commit("setSettingsProcessingCalibre", calibre);
      }
    },

    url: {
      get() {
        return this.$store.state.settings.processing.url;
      },

      set(url) {
        this.$store.commit("setSettingsProcessingUrl", url);
      }
    },

    username: {
      get() {
        return this.$store.state.settings.processing.username;
      },

      set(username) {
        this.$store.commit("setSettingsProcessingUsername", username);
      }
    },

    password: {
      get() {
        return this.$store.state.settings.processing.password;
      },

      set(password) {
        this.$store.commit("setSettingsProcessingPassword", password);
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


