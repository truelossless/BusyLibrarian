// our client-side axios need to query the self-hosted api
// https://stackoverflow.com/questions/53851269/nuxt-axios-dynamic-url
const config = require('@/nuxt.config.js')
export default function ({ $axios }) {
    if (process.client) {
        const hostname = window.location.hostname;
        $axios.defaults.baseURL = "http://" + hostname + ":" + config.server.port;
    }
}