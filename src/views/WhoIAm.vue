<script>
import sleep from 'js-util/sleep';
import MathEx from 'js-util/MathEx';
import normalizeWheel from 'normalize-wheel';

import store from '@/store';
import WhoIAmSection from '@/components/who-i-am/WhoIAmSection.vue';
import WhoIAmHeading from '@/components/who-i-am/WhoIAmHeading.vue';
import WhoIAmThanks from '@/components/who-i-am/WhoIAmThanks.vue';
import WhoIAmLinks from '@/components/who-i-am/WhoIAmLinks.vue';

export default {
  name: 'WhoIAm',
  metaInfo: {
    title: 'Qui suis je / '
  },
  components: {
    WhoIAmSection,
    WhoIAmHeading,
    WhoIAmThanks,
    WhoIAmLinks
  },
  data() {
    return {
      scrollY: 0,
      anchorY: 0,
      clientHeight: 0,
      isRendering: false
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
        this.$router.push(
          `/articles/${state.works[state.works.length - 1].key}/`
        );
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
            `/articles/${state.works[state.works.length - 1].key}/`
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
  }
};
</script>

<template lang="pug">
.p-view-wrap
  .p-whoiam-wrap(
    :style = 'styles'
    ref = 'whoiam-wrap'
    )
    .p-whoiam-wrap__in
      WhoIAmHeading
      WhoIAmSection(
        :num = '1'
        :scrollY = 'scrollY'
        :parallaxRatio = '0.1'
        )
        h2
          |Journaliste société, politique, culture, sport et international.
          br
          |Bousillé de rap.
        p
          |J'ai toujours aimé écrire. Sentir le graphite sur le papier ou les touches sous mes doigts. Plus jeune, j'écrivais des histoires, des chansons, des pensées, des bandes dessinées ou des poèmes. Puis je suis tombé sous le charme du journal, cet objet de culture, de savoir, de satire. Très tôt j'ai su que je voulais être journaliste. 
        p
          |Alors, après une licence d'Histoire, qui m'a appris la recherche et le recoupement des sources et m'a forgé une solide culture générale, j'ai obtenu un master de journalisme plurimédias, spécialités presse écrite - web et radio, enseignement très pratique complété par plusieurs stages plus ou moins formateurs. 
        p
          |Au sein de l'Humanité, où l'on n'hésite pas à me confier des responsabilités (et même une rubrique complète durant un mois !), j'apprends que "notre métier est de porter la plume dans la plaie", comme l'écrivait Albert Londres. Dans de plus petits médias, j'écris, j'interviewe, je filme, je monte, et j'aime marcher dans les rues avec tout mon matos. 
      WhoIAmSection(
        :num = '2'
        )
        h2
          |Amour du rap.
          br
          |Aider les médias à s'élever contre l'injustice.
        p
          |En parallèle, je tombe amoureux du rap. De ces nouveaux écrivains, justement, qui réinventent la langue et la grammaire, qui me font lire leurs images au travers de leurs mots. Ces artistes dont l'écriture est corrosive, elle aussi. Je prends donc le micro pour parler de cet art, format podcast, seul ou entouré. 
        p
          |Capable d'écrire et de parler sur plusieurs thèmes, je trouve cependant ma plume plus utile quand elle défend les opprimé.e.s, dénonce les injustices, ou essaie de faire découvrir des choses. Qui prétend faire du journalisme sans prendre position ?
      WhoIAmLinks(
        :scrollY = 'scrollY'
        :parallaxRatio = '0.05'
        )
      WhoIAmThanks
</template>

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
</style>
