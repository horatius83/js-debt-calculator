import { loansSummary } from './loans-summary.vue.js'
import { GraphPage } from './graph-page.vue.js';

const routes = [
    { path: '/', component: loansSummary },
    { path: '/graph', component: GraphPage },
    { path: '/plan', component: loansSummary },
    { path: '/import', component: loansSummary },
    { path: '/export', component: loansSummary },
];

const router = new VueRouter({
    routes
});

var app = new Vue({
    router,
}).$mount('#main');