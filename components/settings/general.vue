<template>
  <div>
    <h1>General settings</h1>
    <el-form label-width="100px">
      <h3>Changing port</h3>
      <p>Changing BusyLibrarian port is somewhat complicated because all the client files need to be built again.</p>
      <p>
        Open package.json and in the start script change
        <strong>PORT={{ port }}</strong> to your desired port.
      </p>
      <p>
        Then, build again BusyLibrarian:
        <code>npm run build</code>
      </p>
      <h3>Credentials</h3>
      <p><em>Restart required to take your new credentials into account.</em></p>
      <p>Enabling login to the BusyLibrarian interface is highly recommanded.</p>
      <p>Or else I'm gonna steal all your passwords. But you choose.</p>
      <el-form-item label="Enable login">
        <el-switch v-model="login"></el-switch>
      </el-form-item>
    </el-form>
    <el-form :disabled="!login" label-width="80px">
      <el-form-item label="Username">
        <el-input v-model="username"></el-input>
      </el-form-item>

      <el-form-item label="Password">
        <el-input v-model="password" show-password></el-input>
      </el-form-item>
    </el-form>
    <p>
      <em>
        Passwords are stored in your settings.json file and aren't encrypted.
        <br />Make sure to restrict the access to this file.
      </em>
    </p>
  </div>
</template>
<script>
export default {
  computed: {
    port() {
      if (process.client) {
        return location.port;
      } else {
        return "";
      }
    },
    login: {
      get() {
        return this.$store.state.settings.general.login;
      },
      set(login) {
        this.$store.commit("setSettingsGeneralLogin", login);
      }
    },
    username: {
      get() {
        return this.$store.state.settings.general.username;
      },
      set(username) {
        this.$store.commit("setSettingsGeneralUsername", username);
      }
    },
    password: {
      get() {
        return this.$store.state.settings.general.password;
      },
      set(password) {
        this.$store.commit("setSettingsGeneralPassword", password);
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
