<template>
  <div class="p-view-wrap" :style="styles">
    <div class="p-whoiam-wrap" ref="articles-wrap">
      <div class="p-whoiam-wrap__in">
        <div class="back">
          <router-link to="./">Retour</router-link>
        </div>
        <h1 class="blog-title p-whoiam-heading">
          {{ $prismic.richTextAsPlain(fields.title) }}
        </h1>
        <p class="blog-post-meta">
          <span class="created-at">
            {{
              Intl.DateTimeFormat('fr-FR', dateOptions).format(
                new Date(fields.date)
              )
            }}
          </span>
        </p>
        <slices-block
          :slices="slices"
          :num="1"
          :scrollY="scrollY"
          :parallaxRatio="0.1"
        />
      </div>
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
  props: {
    num: {
      type: Number,
      default: 0
    },
    parallaxRatio: {
      type: Number,
      default: 0
    }
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
    classnames() {
      return [`p-whoiam-section--${this.num}`];
    },
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
    this.$store.commit('showWhoIAmObjs', {
      index: 1,
      direction: -1
    });
    this.$store.commit('showArticleObjs', true);
    await sleep(500);
    this.getContent(this.$route.params.uid);
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
      this.getContent(this.$route.params.uid);
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
        this.$router.push('/articles/');
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
      this.getContent(this.$route.params.uid);
      this.clientHeight = this.$refs['articles-wrap'].clientHeight;
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

<style lang="scss">
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
.p-whoiam-heading {
  font-size: 2.5rem !important;
  perspective: 500px;
  line-height: (70 / 60);
  @include fontSizeAll(40, 40, 20);
  letter-spacing: 0.15em;
  @include l-more-than-mobile {
    margin-bottom: 145px;
    margin-left: 40%;
  }
  @include l-mobile {
    margin-bottom: 50px;
  }
  &__in {
    display: block;

    transition-property: transform;
    transform-origin: center left;
    .view-enter &,
    .view-asc-leave-to & {
      transform: translate3d(0, 100px, 30px) rotate3d(1, 0, 0.5, 10deg);
    }
    .view-asc-enter &,
    .view-leave-to & {
      transform: translate3d(0, -100px, 30px) rotate3d(1, 0, 0.5, -10deg);
    }
    .view-enter-to &,
    .view-asc-enter-to & {
      transition-duration: 1.1s;
      transition-delay: 0.8s;
      transition-timing-function: $easeOutQuad;
    }
    .view-leave-to &,
    .view-asc-leave-to & {
      transition-duration: 0.65s;
      transition-timing-function: $easeInQuad;
    }
  }
  &__row {
    display: block;

    // Transition
    transition-property: opacity, transform;
    transform-origin: center left;
    .view-enter &,
    .view-asc-enter & {
      opacity: 0;
    }
    .view-enter &,
    .view-asc-leave-to & {
      transform: translate3d(0, 100px, 0);
    }
    .view-asc-enter &,
    .view-leave-to & {
      transform: translate3d(0, -100px, 0);
    }
    .view-enter-to &,
    .view-asc-enter-to & {
      opacity: 1;
      transition-duration: 1s;
      transition-timing-function: $easeOutQuad;
      @include iterateTransitionDelay(2, 0.1, 0.8);
    }
    .view-leave-to &,
    .view-asc-leave-to & {
      opacity: 0;
      transition-duration: 0.6s;
      transition-timing-function: $easeInQuad;
      @include iterateTransitionDelay(2, -0.1, 0.1);
    }
  }
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
.p-whoiam-section {
  text-align: justify;
  @include l-more-than-mobile {
    width: 500 / 1360 * 100%;
  }
  @include l-mobile {
    margin-bottom: 50px;
  }
  &--1 {
    @include l-more-than-mobile {
      margin-left: 50%;
      margin-bottom: 120px;
    }
  }
  &--2 {
    @include l-more-than-mobile {
      margin-left: 20%;
      margin-bottom: 120px;
    }
  }
  &--3 {
    @include l-more-than-mobile {
      margin-left: 500 / 1360 * 100%;
      margin-bottom: 180px;
    }
  }
  h2 {
    line-height: (30 / 18);
    margin-top: 0;
    @include fontSizeAll(18, 18, 12);
    @include l-more-than-mobile {
      margin-bottom: 35px;
    }
    @include l-mobile {
    }
  }
  p {
    margin-top: 0;
    margin-bottom: 20px;
  }

  // Transition
  transition-property: opacity, transform;
  .view-enter &,
  .view-asc-enter & {
    opacity: 0;
  }
  .view-enter &,
  .view-asc-leave-to & {
    transform: translate3d(0, 100px, 0);
  }
  .view-asc-enter &,
  .view-leave-to & {
    transform: translate3d(0, -100px, 0);
  }
  .view-enter-to &,
  .view-asc-enter-to & {
    opacity: 1;
    transition-duration: 1s;
    transition-delay: 1.2s;
    transition-timing-function: $easeOutQuad;
  }
  .view-leave-to &,
  .view-asc-leave-to & {
    opacity: 0;
    transition-duration: 0.6s;
    transition-delay: 0s;
    transition-timing-function: $easeInQuad;
  }
}
</style>
