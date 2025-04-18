module.exports = {
  // 只预缓存静态资源，不包含 HTML
  globPatterns: [
    '**/*.{js,css,png,jpg,jpeg,gif,svg,webp,eot,ttf,woff,woff2,mp3}'
  ],
  globDirectory: 'public',
  swDest: 'public/service-worker.js',
  maximumFileSizeToCacheInBytes: 209715200, // 200MB

  // 新版本立即生效
  skipWaiting: true,
  clientsClaim: true,

  // 自动清理过期 precache（静态资源）
  cleanupOutdatedCaches: true,

  runtimeCaching: [
    // —— 按需缓存 HTML 页面 —— 
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst', // 或 'StaleWhileRevalidate'，看你更偏向“更鲜”还是“更快”
      options: {
        cacheName: 'page-cache',
        networkTimeoutSeconds: 10,      // 可选：超时后直接走缓存
        plugins: [
          // 仅按天数设置过期，不限数量
          new workbox.expiration.ExpirationPlugin({
            maxAgeSeconds: 7 * 24 * 60 * 60, // 缓存保留 7 天
            purgeOnQuotaError: true         // 配额不足时自动清理旧条目
          })
        ]
      }
    },

    // —— JS/CSS 脚本 & 样式（预缓存外的运行时更新） —— 
    {
      urlPattern: ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }
      }
    },

    // —— 图片资源 —— 
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }
      }
    },

    // —— 音频资源 —— 
    {
      urlPattern: ({ request }) =>
        request.destination === 'audio' ||
        /\.(mp3|wav|ogg)$/i.test(request.url),
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-cache',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
        plugins: [
          new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200]
          }),
          new workbox.rangeRequests.RangeRequestsPlugin()
        ]
      }
    },

    // —— CDN 资源 —— 
    {
      urlPattern: /^https:\/\/cdn\.yesandnoandperhaps\.cn\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cdn-cache',
        expiration: {
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }
      }
    },

    // —— API 请求 —— 
    {
      urlPattern: /^https:\/\/yesandnoandperhaps\.cn\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }
      }
    }
  ]
}
