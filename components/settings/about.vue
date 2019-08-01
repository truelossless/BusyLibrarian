<template>
  <div>
    <h1>BusyLibrarian {{ $store.state.version }}</h1>
    <p>Spaghetti code by truelossless</p>
    <p><a href="https://github.com/truelossless/">https://github.com/truelossless/</a></p>
    <p>Download ebooks from torrents and import them automatically in calibre !</p>
    <p>Inspired by LazyLibrarian, and conceived as a simpler (and less complete) alternative.</p>
    <el-divider></el-divider>
    <p>Powered by Nuxt.js and Vue.js.</p>
    <p>With the beautiful Element UI framework !</p>
  </div>
</template>
<style scoped>
h1 {
  margin-top: 20px;
  margin-bottom: 30px;
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