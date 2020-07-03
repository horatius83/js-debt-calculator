const cacheName = 'loans-pwa';
const filestoCache = [
    // JS Files
    '../services/loan-service.js',
    'vue-router.js',
    'Chart.js',
    'serviceWorker.js',
    'accounting.min.js',
    'vue.js',
    '../components/new-loan.vue.js',
    '../components/loans-summary.vue.js',
    '../components/loan-strategy.vue.js',
    '../components/main.vue.js',
    '../components/plan-page.vue.js',
    '../components/loan-graph.vue.js',
    '../components/payment-summary.vue.js',
    '../components/payment-plan-component.vue.js',
    '../components/filters.vue.js',
    '../components/max-payment.vue.js',
    '../components/loans.vue.js',
    '../components/graph-page.vue.js',
    '../models/loan/paymentPlan.js',
    '../models/loan/loan.js',
    '../models/loan/loanPaymentPlan.js',
    '../models/loan/payment.js',
    '../models/loan/paymentStrategy.js',
    '../models/util/interest.js',

    // CSS Files
    '../css/loans.css',
    '../css/mini-dark.min.css',

    // HTML Files
    '../index.html',

    // Images
    "../images/icons/icon-128x128.png",
    "../images/icons/icon-144x144.png",
    "../images/icons/icon-152x152.png",
    "../images/icons/icon-192x192.png",
    "../images/icons/icon-256x256.png",
    "../images/icons/icon-512x512.png"
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