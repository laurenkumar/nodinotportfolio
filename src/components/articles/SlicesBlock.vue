<script>
// Imports for all slices
const QuoteSlice = () => import('./slices/QuoteSlice.vue');
const TextSlice = () => import('./slices/TextSlice.vue');
const ImageCaptionSlice = () => import('./slices/ImageCaptionSlice.vue');
export default {
  props: ['slices', 'num', 'scrollY'],
  name: 'slices-block',
  components: {
    QuoteSlice,
    TextSlice,
    ImageCaptionSlice
  },
  computed: {
    classnames() {
      return [`p-whoiam-section--${this.num}`];
    }
  }
};
</script>

<template>
  <section class="p-who-section" :scrollY="scrollY">
    <!-- Slice section template -->
    <section v-for="(slice, index) in slices" :key="'slice-' + index">
      <!-- Text slice template -->
      <template v-if="slice.slice_type === 'text'">
        <!-- Here :slice="slice" passes the data to the component -->
        <text-slice :slice="slice"></text-slice>
      </template>
      <!-- Quote slice template -->
      <template v-else-if="slice.slice_type === 'quote'">
        <quote-slice :slice="slice"></quote-slice>
      </template>
      <!-- Image with caption slice template -->
      <template v-else-if="slice.slice_type === 'image_with_caption'">
        <image-caption-slice :slice="slice"></image-caption-slice>
      </template>
    </section>
  </section>
</template>

<style lang="scss">
.p-who-section {
  text-align: justify;
  @include l-more-than-mobile {
    width: 700 / 1360 * 100%;
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
