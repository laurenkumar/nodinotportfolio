import Vue from 'vue';
import Router from 'vue-router';
import Meta from 'vue-meta';

import Home from './views/Home.vue';
import Articles from './views/Articles.vue';
import Article from './views/Article.vue';
import Works from './views/Works.vue';
import WhoIAm from './views/WhoIAm.vue';
import Error404 from './views/Error404.vue';

Vue.use(Router);
Vue.use(Meta);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'accueil',
      component: Home
    },
    {
      path: '/articles/:key',
      name: 'articles',
      component: Works
    },
    {
      path: '/qui-suis-je',
      name: 'who-i-am',
      component: WhoIAm
    },
    {
      path: '/blog/:tag',
      name: 'blog',
      component: Articles
    },
    {
      path: '/blog/:tag/:uid',
      name: 'article',
      component: Article
    },
    {
      path: '*',
      name: 'erreur-404',
      component: Error404
    }
  ]
});

router.afterEach(to => {
  /* global gtag */
  gtag('config', 'UA-143840850-2', { page_path: to.path });
});

export default router;
