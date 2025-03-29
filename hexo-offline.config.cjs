module.exports = {
    globPatterns: ['**/*.{js,html,css,png,jpg,jpeg,gif,svg,webp,eot,ttf,woff,woff2,mp3}'],
    globDirectory: 'public',
    swDest: 'public/service-worker.js',
    maximumFileSizeToCacheInBytes: 209715200, // 10MB
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-cache',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 1000 }
        }
      },

      {
        urlPattern: ({ request }) => 
          request.destination === 'audio' || // 通过 MIME 类型匹配
          /\.(mp3|wav|ogg)$/i.test(request.url), // 通过文件扩展名匹配
        handler: 'CacheFirst',
        options: {
          cacheName: 'audio-cache',
          expiration: {
            maxEntries: 50, // 最多缓存 50 首音乐
            maxAgeSeconds: 60 * 60 * 24 * 120 // 120 天过期
          },
          // 添加缓存插件确保大文件完整存储
          plugins: [
            new workbox.cacheableResponse.CacheableResponsePlugin({
              statuses: [0, 200] // 兼容 opaque responses
            }),
            new workbox.rangeRequests.RangeRequestsPlugin() // 支持音频分段加载
          ]
        }
      },
      // 缓存静态资源（如你的 CSS、JS）
      {
        urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 30 天
          }
        }
      },
      // 缓存图片资源
      {
        urlPattern: ({ request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 7 天
          }
        }
      },
      // 缓存你的 CDN 资源
      {
        urlPattern: /^https:\/\/cdn\.yesandnoandperhaps\.cn\/.*/, 
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-cache',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 30 天
          }
        }
      },
      // 缓存 API 请求（如果你的站点有 API）
      {
        urlPattern: /^https:\/\/yesandnoandperhaps\.cn\/api\/.*/, 
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 天
          }
        }
      }
    ]
}

  