export const state = () => ({
    menuIndex: '-1',
    clientLogs: [],
    settings: {
        general: {
            login: false,
            username: '',
            password: ''
        },
        provider: {
            url: '',
            apiKey: '',
        },
        downloader: {
            url: '',
            port: '',
            username: '',
            password: '',
            dir: ''
        },
        processing: {
            calibre: false,
            url: '',
            username: '',
            password: ''
        }
    },
    version: 'v1.1'
});

export const mutations = {

    // set the global menu index
    setMenuIndex(state, index) {
        state.menuIndex = index;
    },

    // add a log
    appendLog(state, { level, log }) {
        state.clientLogs.push({
            log,
            level,
            date: new Date().toLocaleString("en-US")
        });
    },

    loadSettings(state, settings) {
        state.settings = settings;
        state.settingsLoaded = true;
    },

    setSettingsGeneralLogin(state, login) {
        state.settings.general.login = login;
    },

    setSettingsGeneralUsername(state, username) {
        state.settings.general.username = username;
    },

    setSettingsGeneralPassword(state, password) {
        state.settings.general.password = password;
    },

    setSettingsProviderApiKey(state, apiKey) {
        state.settings.provider.apiKey = apiKey;
    },

    setSettingsProviderUrl(state, url) {
        state.settings.provider.url = url;
    },

    setSettingsDownloaderUrl(state, url) {
        state.settings.downloader.url = url;
    },

    setSettingsDownloaderPort(state, port) {
        state.settings.downloader.port = port;
    },

    setSettingsDownloaderUsername(state, username) {
        state.settings.downloader.username = username;
    },

    setSettingsDownloaderPassword(state, password) {
        state.settings.downloader.password = password;
    },

    setSettingsDownloaderDir(state, dir) {
        state.settings.downloader.dir = dir;
    },

    setSettingsProcessingCalibre(state, calibre) {
        state.settings.processing.calibre = calibre;
    },

    setSettingsProcessingUrl(state, url) {
        state.settings.processing.url = url;
    },

    setSettingsProcessingUsername(state, username) {
        state.settings.processing.username = username;
    },

    setSettingsProcessingPassword(state, password) {
        state.settings.processing.password = password;
    }
};

export const actions = {
    async nuxtServerInit({ commit, state }, { $axios }) {

        // load the settings
        try {
            let { data } = await $axios.post('/api/settings');

            if (data.success) {
                commit('loadSettings', data.settings);
                commit('appendLog', {
                    level: 'VERBOSE',
                    log: 'Loaded settings.'
                });
            } else {
                commit('appendLog', {
                    level: 'ERROR',
                    log: 'Could not load settings: ' + data.error
                });
            }

        } catch (e) {
            commit('appendLog', {
                level: 'ERROR',
                log: 'Could not load settings: ' + e
            });
        }

    },

    async saveChanges({ commit, state }) {

        try {
            let { data } = await this.$axios.post('/api/set_settings', {
                settings: state.settings
            });

            if (data.success) {

                commit('appendLog', {
                    level: 'VERBOSE',
                    log: 'Settings saved.'
                });

            } else {
                commit('appendLog', {
                    level: 'ERROR',
                    log: data.error
                });

            }

        } catch (e) {
            commit('appendLog', {
                level: 'ERROR',
                log: 'Could not save settings !'
            })
        }
    }
};