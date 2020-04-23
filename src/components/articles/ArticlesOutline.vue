<script>
export default {
  name: 'blog-posts',
  data() {
    return {
      posts: [],
      dateOptions: { year: 'numeric', month: 'short', day: '2-digit' },
      linkResolver: this.$prismic.linkResolver
    };
  },
  props: {
    num: {
      type: Number,
      default: 0
    },
    scrollY: {
      type: Number,
      default: 0
    },
    parallaxRatio: {
      type: Number,
      default: 0
    }
  },
  computed: {
    classnames() {
      return [`p-whoiam-section--${this.num}`];
    }
  },
  methods: {
    getPosts() {
      //Query to get blog posts
      this.$prismic.client
        .query(this.$prismic.Predicates.at('document.type', 'post'), {
          orderings: '[my.post.date desc]'
        })
        .then(response => {
          this.posts = response.results;
        });
    },
    //Function to get the first paragraph of text in a blog post and limit the displayed text at 300 characters
    getFirstParagraph(post) {
      const textLimit = 300;
      const slices = post.data.body;
      let firstParagraph = '';
      let haveFirstParagraph = false;
      slices.map(function(slice) {
        if (!haveFirstParagraph) {
          if (slice.slice_type == 'text') {
            slice.primary.text.forEach(function(block) {
              if (block.type == 'paragraph') {
                if (!haveFirstParagraph) {
                  firstParagraph += block.text;
                  haveFirstParagraph = true;
                }
              }
            });
          }
        }
      });

      const limitedText = firstParagraph.substr(0, textLimit);
      if (firstParagraph.length > textLimit) {
        return limitedText.substr(0, limitedText.lastIndexOf(' ')) + '...';
      } else {
        return firstParagraph;
      }
    }
  },
  created() {
    this.getPosts();
  }
};
</script>

<template>
  <div v-if="posts.length !== 0">
    <div
      v-for="post in posts"
      :key="post.id"
      v-bind:post="post"
      class="blog-post"
    >
      <router-link :to="linkResolver(post)">
        <h2 class="p-whoiam-heading">
          {{ $prismic.richTextAsPlain(post.data.title) }}
        </h2>
        <p
          class="blog-post-meta p-whoiam-section"
          :class="classnames"
          :scrollY="scrollY"
          :parallaxRatio="parallaxRatio"
        >
          <span class="created-at">
            {{
              Intl.DateTimeFormat('fr-FR', dateOptions).format(
                new Date(post.data.date)
              )
            }}
          </span>
        </p>
        <div>
          <p class="p-whoiam-section">{{ getFirstParagraph(post) }}</p>
        </div>
      </router-link>
    </div>
  </div>
  <div v-else class="blog-main">
    <p>Aucun post publié pour le moment.</p>
  </div>
</template>

<style lang="scss">
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
.p-whoiam-heading {
  perspective: 500px;
  line-height: (70 / 60);
  @include fontSizeAll(60, 60, 30);
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

    // Transition
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
</style>
