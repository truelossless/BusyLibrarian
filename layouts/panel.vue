<template>
  <el-container direction="vertical">
    <el-menu
      :default-active="$store.state.menuIndex"
      class="el-menu-demo"
      mode="horizontal"
    >
      <el-menu-item index="0" disabled class="title">
        <h1>BusyLibrarian</h1>
      </el-menu-item>
      <el-menu-item index="1" @click="$router.push('/')">Ebooks</el-menu-item>
      <el-menu-item index="2" @click="$router.push('/settings')">Settings</el-menu-item>
      <el-menu-item index="3" @click="$router.push('/logs')">Logs</el-menu-item>
    </el-menu>
    <el-main>
      <nuxt />
    </el-main>
  </el-container>
</template>
<style scoped>

.el-main {
  padding: 0;
  padding-top: 50px;
  width: 100%;
  max-width: 960px;
  margin: auto;
}

.title {
  opacity: 1;
  margin-right: 10px;
}

.title h1 {
  color: #000;
  font-size: 26px;
}

.title:hover {
  cursor: auto;
}
</style>

