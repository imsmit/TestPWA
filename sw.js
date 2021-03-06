var version = "0.15";
var cache_name = 'thepwa-${version}';

var urlsToCache = [
    'vendor/bootstrap/css/bootstrap.min.css',
    'vendor/jquery/jquery.min.js',
    'vendor/bootstrap/js/bootstrap.bundle.min.js',
    'vendor/jquery-easing/jquery.easing.min.js',
    'fonts/DancingScript-Regular.ttf'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(cache_name)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache).then(self.skipWaiting());

            })
    );
});


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(cache_name)
                            .then(function (cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});


self.addEventListener('activate', function (event) {

    var cacheWhitelist = [];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
