<template>
  <!-- Vue conditional to check if there is any content in document -->
  <div v-if="hasContent" class="p-view-wrap">
    <!-- Vue reference for blog posts component -->
    <blog-posts />
  </div>
  <!-- If no content return message -->
  <p v-else class="p-view-wrap">
    Please add some content to your blog home document.
  </p>
</template>

<script>
import sleep from 'js-util/sleep';
import MathEx from 'js-util/MathEx';
import normalizeWheel from 'normalize-wheel';
import store from '@/store';
import BlogPosts from '../components/articles/ArticlesOutline.vue';
export default {
  name: 'blog-home',
  components: {
    BlogPosts
  },
  data() {
    return {
      scrollY: 0,
      anchorY: 0,
      clientHeight: 0,
      isRendering: false,
      documentId: '',
      fields: {
        headline: null,
        description: null,
        image: null
      },
      posts: [],
      linkResolver: this.$prismic.linkResolver,
      hasContent: false
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
    this.getContent();
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
    },
    getContent() {
      //Query to get home content
      this.$prismic.client.getSingle('blog_home').then(document => {
        if (document) {
          this.documentId = document.id;
          this.fields.headline = document.data.headline;
          this.fields.description = document.data.description;
          this.fields.image = document.data.image.url;
          //Check that the blog home contains content
          this.checkForContent();
        } else {
          //returns error page
          this.$router.push({ name: 'not-found' });
        }
      });
    },
    //Function to check for any content on the blog home page
    checkForContent() {
      if (
        this.fields.image != undefined ||
        this.$prismic.richTextAsPlain(this.fields.headline) !== '' ||
        this.$prismic.richTextAsPlain(this.fields.description) !== ''
      ) {
        this.hasContent = true;
      }
    }
  }
};
</script>

<style scoped>
.home {
  max-width: 700px;
  margin: auto;
  text-align: center;
}
.home .blog-avatar {
  height: 140px;
  width: 140px;
  border-radius: 50%;
  background-position: center;
  background-size: cover;
  margin: 1em auto;
}
.home .blog-description {
  font-size: 18px;
  color: #a9a9a;
  line-height: 30px;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  font-family: 'Lato', sans-serif;
  border-bottom: 1px solid #dadada;
}
/* Media Queries */
@media (max-width: 767px) {
  .home {
    padding: 0 20px;
  }
}
</style>
