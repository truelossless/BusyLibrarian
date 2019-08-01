<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="General">
        <general></general>
      </el-tab-pane>
      <el-tab-pane label="Provider">
        <providers></providers>
      </el-tab-pane>
      <el-tab-pane label="Downloader">
        <downloaders></downloaders>
      </el-tab-pane>
      <el-tab-pane label="Processing">
        <processing></processing>
      </el-tab-pane>
      <el-tab-pane label="About">
        <about></about>
      </el-tab-pane>
    </el-tabs>
    <div class="save-border">
      <el-button @click="$store.dispatch('saveChanges')">Save changes</el-button>
    </div>
  </div>
</template>
<script>
import general from '@/components/settings/general'
import providers from "@/components/settings/providers";
import downloaders from "@/components/settings/downloaders";
import processing from "@/components/settings/processing";
import about from '@/components/settings/about'

export default {
  layout: "panel",
  components: {
    general,
    providers,
    downloaders,
    processing,
    about
  },

  created() {
    this.$store.commit("setMenuIndex", "2");
  }
};
</script>
<style scoped>
#version {
  font-size: 14px;
  color: #aaa;
}

.el-tabs,
.el-tabs__content {
  min-height: 99%;
}

.el-tabs .el-button {
  float: right;
}

.save-border {
  padding-bottom: 10px;
  margin-top: -2px;
  background: #fff;
  height: 60px;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-top: none;
}

.save-border .el-button {
  margin-right: 20px;
  float: right;
}
</style>
