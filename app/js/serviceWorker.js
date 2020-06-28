const cacheName = 'loans-pwa';
const filestoCache = [
    // JS Files
    '/services/loan-service.js',
    '/js/vue-router.js',
    '/js/Chart.js',
    '/js/serviceWorker.js',
    '/js/accounting.min.js',
    '/js/vue.js',
    '/components/new-loan.vue.js',
    '/components/loans-summary.vue.js',
    '/components/loan-strategy.vue.js',
    '/components/main.vue.js',
    '/components/plan-page.vue.js',
    '/components/loan-graph.vue.js',
    '/components/payment-summary.vue.js',
    '/components/payment-plan-component.vue.js',
    '/components/filters.vue.js',
    '/components/max-payment.vue.js',
    '/components/loans.vue.js',
    '/components/graph-page.vue.js',
    '/models/loan/paymentPlan.js',
    '/models/loan/loan.js',
    '/models/loan/loanPaymentPlan.js',
    '/models/loan/payment.js',
    '/models/loan/paymentStrategy.js',
    '/models/util/interest.js',

    // CSS Files
    '/css/loans.css',
    '/css/mini-dark.min.css',

    // HTML Files
    '/',
    '/index.html'
];

// Start the service worker to cache all the content
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filestoCache);
        })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});