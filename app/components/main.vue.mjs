import { loansSummary } from './loans-summary.vue.mjs'
import { GraphPage } from './graph-page.vue.mjs';
import { PlanPage } from './plan-page.vue.mjs';

const routes = [
    { path: '/', component: loansSummary },
    { path: '/graph', component: GraphPage },
    { path: '/plan', component: PlanPage },
    { path: '/import', component: loansSummary },
    { path: '/export', component: loansSummary },
];

const router = new VueRouter({
    routes
});

var app = new Vue({
    router,
}).$mount('#main');