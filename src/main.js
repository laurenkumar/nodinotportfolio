import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import PrismicVue from 'prismic-vue';
import linkResolver from './prismic/link-resolver';
import htmlSerializer from './prismic/html-serializer';
import './registerServiceWorker';

Vue.config.productionTip = false;

Vue.use(PrismicVue, {
  endpoint: 'https://axelnodinot.cdn.prismic.io/api/v2',
  linkResolver,
  htmlSerializer
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
