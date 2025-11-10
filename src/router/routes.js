const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/keycaps',
        component: () => import('pages/keycaps.vue')
      },
      {
        path: '/keyboard',
        component: () => import('pages/keyboard.vue')
      },

      {
        path: '/favorites',
        component: () => import('pages/Favorites.vue')
      },
      {
        path: '/favorites/Keycaps/JTK',
        component: () => import('pages/FavoritesJTK.vue')
      },
      {
        path: '/favorites/Keycaps/GMK',
        component: () => import('pages/FavoritesGMK.vue')
      },
      {
        path: '/following',
        component: () => import('pages/Following.vue')
      },
      {
        path: '/following/Keyboard',
        component: () => import('pages/FollowingKeyboard.vue')
      },
      {
        path: '/following/Keycaps',
        component: () => import('pages/FollowingKeycaps.vue')
      },
      {
        path: '/favorites/Keyboard',
        component: () => import('pages/FavoritesKeyboard.vue')
      },
      {
        path: '/favorites/Keycaps',
        component: () => import('pages/FavoritesKeycaps.vue')
      },
      {
        path: '/keyboard3d',
        component: () => import('pages/Keyboard3DView.vue')
      },
      {
        path: '/advanced-keyboard3d',
        component: () => import('pages/AdvancedKeyboard3DView.vue')
      },
      {
        path: '/keyboard3d-demo',
        component: () => import('pages/Keyboard3DDemo.vue')
      },
      {
        path: '/keyboard-customizer',
        component: () => import('pages/KeyboardCustomizer.vue')
      },
      {
        path: '/keyboard-detail/:id',
        component: () => import('pages/KeyboardDetail.vue')
      },
      {
        path: '/keycap-detail/:id',
        component: () => import('pages/KeycapDetail.vue')
      }
    ]
  }
]

export default routes
