<template>
  <div>
    <h1>Transmission</h1>
    <p>
      <em>Currently, only transmission is supported.</em><br>
      <em>Changing data here may require a restart of BusyLibrarian.</em>
    </p>
    <el-form label-width="80px">
      
      <h3>Remote details</h3>
      <p>Where is located your transmission client ?</p>
      <p>Make sure transmission-daemon is installed.</p>

      <el-form-item label="Url">
        <el-input v-model="url"></el-input>
      </el-form-item>
      <el-form-item label="Port">
        <el-input style="max-width: 100px" v-model="port"></el-input>
      </el-form-item>

      <h3>Download directory</h3>
      <p>Required. It's recommanded to have a seperated download directory to allow later an easier processing of your books.</p>
      <p>Make sure to give the according permissions to BusyLibrarian.</p>

      <el-form-item label="Path">
        <el-input v-model="dir"></el-input>
      </el-form-item>

      <h3>Credentials</h3>
      <p>Fill this if your transmission client is password-protected.</p>

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
    url: {
      get() {
        return this.$store.state.settings.downloader.url;
      },

      set(url) {
        this.$store.commit("setSettingsDownloaderUrl", url);
      }
    },
    port: {
      get() {
        return this.$store.state.settings.downloader.port;
      },

      set(port) {
        this.$store.commit("setSettingsDownloaderPort", port);
      }
    },
    dir: {
      get() {
        return this.$store.state.settings.downloader.dir;
      },

      set(dir) {
        this.$store.commit("setSettingsDownloaderDir", dir);
      }
    },
    username: {
      get() {
        return this.$store.state.settings.downloader.username;
      },

      set(username) {
        this.$store.commit("setSettingsDownloaderUsername", username);
      }
    },
    password: {
      get() {
        return this.$store.state.settings.downloader.password;
      },

      set(password) {
        this.$store.commit("setSettingsDownloaderPassword", password);
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