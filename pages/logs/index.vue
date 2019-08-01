<template>
<el-tabs type="border-card">
  <el-tab-pane label="Server">
    <el-table :default-sort = "{prop: 'date', order: 'descending'}" :data="serverLogs" empty-text="no logs here for now :>" style="width: 100%">
      <el-table-column sortable prop="date" label="Date" width="180"></el-table-column>
      <el-table-column sortable prop="level" label="Level" min-width="80"></el-table-column>
      <el-table-column sortable label="Message">
        <template slot-scope="scope">
          <p :style="{color: scope.row.level === 'ERROR' ? '#F56C6C' : 'inherit'}">{{ scope.row.log }}</p>
        </template>
      </el-table-column>
      <el-table-column align="right">
      <template slot="header">
        <el-button @click="getServerLogs" size="medium" type="primary">Refresh</el-button>
      </template>
    </el-table-column>
    </el-table>
  </el-tab-pane>
  <el-tab-pane label="Client">
    <p><em>Client logs aren't kept.</em></p>
    <el-table :default-sort = "{prop: 'date', order: 'descending'}" :data="$store.state.clientLogs" empty-text="no logs here for now :>" style="width: 100%">
      <el-table-column sortable prop="date" label="Date" width="180"></el-table-column>
      <el-table-column sortable prop="level" label="Level" min-width="80"></el-table-column>
      <el-table-column sortable label="Message">
        <template slot-scope="scope">
          <p :style="{color: scope.row.level === 'ERROR' ? '#F56C6C' : 'inherit'}">{{ scope.row.log }}</p>
        </template>
      </el-table-column>
    </el-table>
  </el-tab-pane>
</el-tabs>
</template>
<script>
export default {
  layout: "panel",
  
  data() {
    return {
      serverLogs: []
    }
  },

  methods: {
    async getServerLogs() {
      try {
        this.serverLogs = await this.$axios.$post('/api/logs');
      } catch(e) {
        this.serverLogs = [],
        this.$store.commit('appendLog', {
          level: 'ERROR',
          log: 'Can\'t get the server logs: ' + e 
        });
      }
    }
  },

  created() {
    this.$store.commit("setMenuIndex", "3");
    this.getServerLogs();
  },
};
</script>
