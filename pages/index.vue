<template>
  <div id="main">
    <h1 id="main-title">Look for a book</h1>
    <el-form label-width="120px" :inline="true" @submit.native.prevent>
      <el-form-item label="Author/title/ISBN: ">
        <el-input v-model="search"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchClicked">Search</el-button>
      </el-form-item>
    </el-form>
    <el-form>
      <el-form-item>
        <el-checkbox v-model="bypass">Bypass Google books search</el-checkbox>
      </el-form-item>
    </el-form>

    <el-card v-for="(result, i) in GSResults" :key="result.id" class="book-list">
      <el-row type="flex" justify="space-between">
        <el-col :span="16">
          <h2>{{ result.volumeInfo.title }}</h2>
          <p v-if="result.volumeInfo.authors">{{ result.volumeInfo.authors.join(', ') }}</p>
          <el-button
            ref="download-buttons"
            @click="GBDownload($event, result, i)"
            type="primary"
            icon="el-icon-download"
          >Download</el-button>
        </el-col>
        <el-col :span="8">
          <img
            v-if="result.volumeInfo.imageLinks"
            :src="result.volumeInfo.imageLinks.thumbnail"
            alt="book cover"
          />
          <img
            v-else
            class="missing-cover"
            src="@/assets/img/missing_book.svg"
            alt="missing book cover"
          />
        </el-col>
      </el-row>
    </el-card>
    <div v-if="processing >= 1" class="results">
      <el-steps :active="this.processing" finish-status="success">
        <el-step title="Finding book"></el-step>
        <el-step title="Torznab query"></el-step>
        <el-step title="Result sorting"></el-step>
        <el-step title="Downloading"></el-step>
      </el-steps>
      <h2>Querying your torznab provider ...</h2>
      <el-card v-if="torznabProvider">
        <h2>{{ torznabProvider.title }}</h2>
        <a :href="torznabProvider.url">{{ torznabProvider.url }}</a>
        <p>{{ torznabProvider.description }}</p>
      </el-card>
      <h3>Searching for: "{{ this.formattedSearch }}"</h3>
      <div v-if="retryDownload">
        <p>No result found, looking only for "{{ selectedBookTitle }}" ...</p>
        <p v-if="retryFailed">No result, try switching to a different provider ... :'(</p>
        <div v-else>
          <p>{{ torznabResults.length }} result{{ torznabResults.length === 1 ? '' : 's' }} found now !</p>
          <p>The result may consequently not be accurate.</p>
          <p>If one result seems alright, you can manually download it.</p>
        </div>
      </div>
      <div v-else-if="bypass">
        <p>{{ torznabResults.length }} result{{ torznabResults.length === 1 ? '' : 's' }} found !</p>
        <p>Pick the book you wish to download ...</p>
      </div>
      <div v-else>
        <p>{{ torznabResults.length }} result{{ torznabResults.length === 1 ? '' : 's' }} found !</p>
        <p>Picking the best result to download ...</p>
      </div>
    </div>
    <div v-if="processing >= 2">
      <el-card v-for="result in torznabResults" :key="result.guid" class="search-list">
        <el-row type="flex" justify="space-between">
          <el-col :span="21">
            <p>{{ result.title }}</p>
          </el-col>
          <el-col :span="2" v-if="retryDownload || bypass">
            <el-button icon="el-icon-download" @click="addTorrent(result.enclosure)" circle></el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <div v-if="processing >= 3">
      <h2>Sending torrent to your downloader ...</h2>
    </div>
    <p v-if="processing >= 4">Done !</p>
  </div>
</template>
<script>
export default {
  layout: "panel",
  data() {
    return {
      search: "",
      formattedSearch: "",
      selectedBookTitle: "",
      GSResults: [],
      torznabProvider: {},
      torznabResults: [],
      processing: 0,
      retryDownload: false,
      retryFailed: false,
      bypass: false
    };
  },

  created() {
    this.$store.commit("setMenuIndex", "1");
  },

  methods: {
    async searchClicked() {
      // reset stuff
      this.processing = 0;
      this.GSResults = [];
      this.torznabResults = [];
      this.retryDownload = false;
      this.retryFailed = false;

      // bypass google books search
      if (this.bypass) {
        this.formattedSearch = this.search;
        this.processing += 2;
        await this.searchTorznab(this.search);
      } else {
        this.searchGoogleBooks();
      }
    },

    async searchGoogleBooks() {
      try {
        let res = await this.$axios.$get(
          "https://www.googleapis.com/books/v1/volumes",
          {
            params: {
              q: this.search
            }
          }
        );
        this.GSResults = res.items;
      } catch (e) {
        this.$notify.error({
          title: "Error while getting Google books results",
          message: e
        });
        this.$store.commit("appendLog", {
          level: "ERROR",
          log: e
        });
        return;
      }
    },

    // download from a google books result
    async GBDownload(event, result, i) {
      // it's over, old man (prevent our user from clicking again on the button)
      if (this.processing !== 0 && event) return;

      // we might be retrying our download request so skip the unnecessary bit
      if (!this.retryDownload) {
        if (this.processing !== 0) return;

        this.selectedBookTitle = result.volumeInfo.title.toLocaleLowerCase();

        // some books have no authors
        let mainAuthor = result.volumeInfo.authors
          ? result.volumeInfo.authors[0]
          : "";

        this.formattedSearch = (
          mainAuthor +
          " " +
          result.volumeInfo.title
        ).toLocaleLowerCase();
        // remove characters that could compromise the search
        // search = search.replace(/(-|\)|:|\(|_)/, '');
        event.target.innerHTML = "Download started.";

        // remove all the books but this one
        this.GSResults.splice(i + 1);
        this.GSResults.splice(0, i);

        // visual cue that the book is being downloaded
        this.processing++;

        if (
          !this.$store.state.settings.provider.apiKey ||
          !this.$store.state.settings.provider.url
        ) {
          this.$notify.error({
            title: "Error",
            message: "You haven't configured yet your provider !"
          });
          this.$store.commit("appendLog", {
            level: "ERROR",
            log: "No provider set, aborting download."
          });
        }
      }

      let search = this.retryDownload
        ? this.selectedBookTitle
        : this.formattedSearch;
      this.$store.commit("appendLog", {
        level: "VERBOSE",
        log: 'Starting search for "' + search + '"'
      });

      await this.searchTorznab(search);

      if (this.torznabResults.length === 0) {
        if (this.retryDownload) {
          this.retryFailed = true;
        } else {
          this.retryDownload = true;
          this.GBDownload(null, null, null);
        }
        this.$store.commit("appendLog", {
          level: "WARN",
          log: "No result for this query."
        });
      } else {
        this.processing++;
        this.$store.commit("appendLog", {
          level: "INFO",
          log:
            "Found " +
            this.torznabResults.length +
            " result" +
            (this.torznabResults.length === 1 ? "" : "s") +
            " !"
        });

        // we can send automatically the download to the bittorrent client
        if (!this.retryDownload) {
          this.addTorrent(this.torznabResults[0].enclosure);
        }
      }
    },

    async searchTorznab(search) {
      try {
        let res = await this.$axios.$post("/api/torznab/", {
          q: search,
          apiKey: this.$store.state.settings.provider.apiKey,
          url: this.$store.state.settings.provider.url
        });

        if (res.success) {
          this.torznabProvider = res.provider;
          this.torznabResults = res.items;
          console.log(res);
        } else {
          console.log(res.error);
          this.$notify.error({
            title: "Error",
            message: "Torznab request failed: " + res.error
          });
          this.$store.commit("appendLog", {
            level: "ERROR",
            log: "Torznab request failed: " + res.error
          });
        }
      } catch (e) {
        this.$notify.error({
          title: "Error",
          message: e
        });
      }
    },

    async addTorrent(torrentUrl) {
      this.processing++;

      // check if the downloader is configured
      if (
        !this.$store.state.settings.downloader.url ||
        !this.$store.state.settings.downloader.port ||
        !this.$store.state.settings.downloader.dir
      ) {
        this.$notify.error({
          title: "Error",
          message: "You haven't configured your downloader yet !"
        });
        this.$store.commit("appendLog", {
          level: "ERROR",
          log: "No downloader set, aborting download."
        });
        return;
      }

      // if calibre is enabled, check that it is configured aswell
      if (
        this.$store.state.settings.processing.calibre &
        (!this.$store.state.settings.processing.url ||
          !this.$store.state.settings.processing.username ||
          !this.$store.state.settings.processing.password)
      ) {
        this.$notify.error({
          title: "Error",
          message: "Calibre wrongly configured !"
        });
        this.$store.commit("appendLog", {
          level: "ERROR",
          log: "Calibre wrongly configured."
        });
        return;
      }

      torrentUrl = encodeURI(torrentUrl);

      this.$store.commit("appendLog", {
        level: "VERBOSE",
        log: "Sending torrent url " + torrentUrl + " to transmission."
      });

      try {
        let res = await this.$axios.$post("/api/add_torrent", {
          url: torrentUrl
        });

        if (res.success) {
          this.processing++;
          this.$notify.success({
            title: "Success",
            message: "Book downloaded !"
          });
          this.$store.commit("appendLog", {
            level: "SUCCESS",
            log: "Torrent download started."
          });
        } else {
          this.$notify.error({
            title: "Error",
            message: "Cannot add the download: " + res.error
          });
          this.$store.commit("appendLog", {
            level: "ERROR",
            log: "Cannot add the download: " + res.error
          });
        }
      } catch (e) {
        this.$notify.error({
          title: "Error",
          message: "Cannot add the download: " + e
        });
        this.$store.commit("appendLog", {
          level: "ERROR",
          log: "Cannot add the download: " + e
        });
      }
    }
  }
};
</script>
<style scoped>
#main {
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 30px;
}

#main-title {
  font-size: 40px;
}

h1 {
  margin-bottom: 40px;
}

.el-input {
  width: 300px;
}

.el-card {
  margin-top: 30px;
  margin-bottom: 30px;
  margin-left: 10px;
  margin-right: 10px;
}

.missing-cover {
  width: 50%;
}

.book-list .el-button {
  margin-top: 60px;
}

.search-list .el-button {
  padding: 10px;
}

.results > h2 {
  margin-top: 30px;
  margin-bottom: 30px;
}

.results > h3 {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
