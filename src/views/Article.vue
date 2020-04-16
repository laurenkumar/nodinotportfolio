<template>
  <div class="p-view-wrap">
    <div class="p-whoiam-wrap">
      <div class="back">
        <router-link to="./">Retour</router-link>
      </div>
      <h1 class="blog-title">{{ $prismic.richTextAsPlain(fields.title) }}</h1>
      <p class="blog-post-meta">
        <span class="created-at">
          {{
            Intl.DateTimeFormat('fr-FR', dateOptions).format(
              new Date(fields.date)
            )
          }}
        </span>
      </p>
      <slices-block :slices="slices" />
    </div>
  </div>
</template>

<script>
import sleep from 'js-util/sleep';
import MathEx from 'js-util/MathEx';
import normalizeWheel from 'normalize-wheel';
import store from '@/store';
import SlicesBlock from '../components/articles/SlicesBlock.vue';
export default {
  name: 'post',
  metaInfo: {
    title: 'Article / '
  },
  components: {
    SlicesBlock
  },
  data() {
    return {
      scrollY: 0,
      anchorY: 0,
      clientHeight: 0,
      isRendering: false,
      dateOptions: { year: 'numeric', month: 'short', day: '2-digit' },
      documentId: '',
      fields: {
        title: null,
        date: null
      },
      slices: []
    };
  },
  watch: {
    async '$store.state.resolution.y'() {
      await sleep(10);
      this.resize();
    }
  },
  computed: {
    styles() {
      return {
        paddingTop: `${this.$store.state.resolution.y / 2}px`,
        transform: `translate3d(0, ${-this.scrollY}px, 0)`
      };
    }
  },
  beforeRouteEnter(to, from, next) {
    store.commit('transit', {
      globalId: 50
    });
    next();
  },
  async created() {
    this.getContent(this.$route.params.uid);
    window.addEventListener('wheel', this.wheel, { passive: false });
    window.addEventListener('touchstart', this.touchstart);
    window.addEventListener('touchmove', this.touchmove);
    this.scrollY = 0;
    this.anchorY = 0;
    this.anchorYPrev = 0;
    this.$store.commit('setScrollProgress', 0);
  },
  async mounted() {
    this.$store.commit('changeBackground', {
      isHome: false,
      hasDelay: false
    });
    this.$store.commit('showHomeObjs', false);
    this.$store.commit('showWorksObjs', {
      index: 0,
      direction: 1
    });
    this.$store.commit('showWhoIAmObjs', true);
    await sleep(500);
    this.$store.commit('showUI');
    this.isRendering = true;
    this.resize();
    this.update();
  },
  destroyed() {
    window.removeEventListener('wheel', this.wheel, { passive: false });
    window.removeEventListener('touchstart', this.touchstart);
    window.removeEventListener('touchmove', this.touchmove);
    this.isRendering = false;
  },
  methods: {
    getContent(uid) {
      //Query to get post content
      this.$prismic.client.getByUID('post', uid).then(document => {
        if (document) {
          this.documentId = document.id;
          this.fields.title = document.data.title;
          this.fields.date = document.data.date;

          //Set slices as variable
          this.slices = document.data.body;
        } else {
          //returns error page
          this.$router.push({ name: 'not-found' });
        }
      });
    },
    update() {
      this.scrollY =
        Math.floor((this.scrollY + (this.anchorY - this.scrollY) / 10) * 100) /
        100;
      this.$store.commit(
        'setScrollProgress',
        this.scrollY / (this.clientHeight - this.$store.state.resolution.y)
      );
      if (this.isRendering === true) {
        requestAnimationFrame(this.update);
      }
    },
    wheel(e) {
      e.preventDefault();

      const n = normalizeWheel(e);
      const { state, commit } = this.$store;

      if (state.isWheeling === true) return;

      if (this.scrollY < 1 && n.pixelY < 0) {
        // Go to the previous page.
        commit('startWheeling');
        this.$router.push(`/works/${state.works[state.works.length - 1].key}/`);
      } else {
        // Scroll the content of the current page.
        this.anchorY = MathEx.clamp(
          this.anchorY + n.pixelY,
          0,
          this.clientHeight - state.resolution.y
        );
      }
    },
    touchstart() {
      this.anchorYPrev = this.anchorY;
    },
    touchmove() {
      const { state, commit, dispatch } = this.$store;

      if (state.isTouchMoving === true) {
        if (this.scrollY < 1 && state.touchMove.y > 10) {
          // Go to the previous page.
          dispatch(
            'debounceRouterPush',
            `/works/${state.works[state.works.length - 1].key}/`
          );
          commit('touchEnd');
        } else {
          // Scroll the content of the current page.
          this.anchorY = MathEx.clamp(
            this.anchorYPrev - state.touchMove.y * 1.5,
            0,
            this.clientHeight - state.resolution.y
          );
        }
      }
    },
    resize() {
      this.clientHeight = this.$refs['whoiam-wrap'].clientHeight;
      this.anchorY = MathEx.clamp(
        this.anchorY,
        0,
        this.clientHeight - this.$store.state.resolution.y
      );
      this.$store.commit(
        'setScrollProgress',
        this.scrollY / (this.clientHeight - this.$store.state.resolution.y)
      );
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.getContent(to.params.uid);
    next();
  }
};
</script>

<style>
.p-whoiam-wrap {
  @include l-more-than-mobile {
    margin-right: 7.5%;
    margin-left: 7.5%;
    padding-bottom: 300px;
  }
  @include l-mobile {
    margin-right: 44px;
    margin-left: 44px;
    padding-bottom: 44px;
  }
  &__in {
    position: relative;
    margin-top: -25px;
  }
}
.post-part.single a {
  text-decoration: none;
  background: -webkit-linear-gradient(
    top,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 0.8) 75%
  );
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 0.8) 75%
  );
  background-repeat: repeat-x;
  background-size: 2px 2px;
  background-position: 0 23px;
}
.blog-post-meta {
  color: #a9a9a9;
  font-family: 'Lato', sans-serif;
  margin-bottom: 8px;
}
/* Media Queries */
@media (max-width: 767px) {
  .post-part pre {
    font-size: 14px;
  }
  .blog-post-meta {
    font-size: 16px;
  }
}
@media screen and (min-width: 768px) {
  .blog-post-meta {
    font-size: 16px;
  }
}
</style>
