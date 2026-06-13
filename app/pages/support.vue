<template>
  <main class="support-page">
    <div class="d-flex flex-column gap-6">

      <!-- Top Bar / Navigation -->
      <div class="d-flex justify-start">
        <v-btn class="neo-btn" to="/" id="back-home-btn">
          <v-icon class="mr-2">mdi-arrow-left</v-icon> {{ $t('history.back') }}
        </v-btn>
      </div>

      <!-- Support Container Card -->
      <div class="neo-card p-8 bg-white d-flex flex-column gap-6">
        <div class="text-center py-4">
          <div class="d-inline-flex align-center justify-center p-4 neo-badge mb-4 pink text-white"
            style="border-radius: 50% !important; width: 80px; height: 80px; background-color: var(--color-pink) !important;">
            <v-icon size="40" color="white">mdi-heart</v-icon>
          </div>
          <h2 class="text-h4 font-weight-black mb-2">{{ $t('support.title') }}</h2>
          <p class="text-h6 font-weight-bold text-dark-gray max-width-600 mx-auto">
            {{ $t('support.desc') }}
          </p>
        </div>

        <div class="d-flex flex-column flex-md-row gap-6 mt-4">
          <!-- GrabPay Card -->
          <div
            class="payment-option neo-card flex-grow-1 flex-basis-0 p-6 d-flex flex-column justify-between hover-grab">
            <div>
              <div class="d-flex align-center" style="margin-bottom: 24px;">
                <img src="/logo/logo-grab.svg" alt="GrabPay" style="height: 36px; display: block;" />
              </div>
              <div style="margin-bottom: 32px;">
                <p class="text-body-1 text-dark-gray font-weight-bold mb-0">
                  {{ $t('support.grabDesc') }}
                </p>
              </div>
            </div>
            <div>
              <v-btn class="neo-btn grab w-100 mx-0 my-0 d-flex align-center justify-center gap-2"
                style="min-height: 52px; height: 52px;"
                href="https://grab.onelink.me/2695613898?af_dp=grab%3A%2F%2Fopen%3FscreenType%3DPEERTRANSFER%26method%3DQRCode%26pairingInfo%3DGPTransferbfe3094452a14c9b86a4b5882376ecbe"
                target="_blank" id="grabpay-btn">
                {{ $t('support.grabBtn') }} <v-icon class="ml-2">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Stripe Card -->
          <!-- <div
            class="payment-option neo-card flex-grow-1 flex-basis-0 p-6 d-flex flex-column justify-between gap-6 hover-pink">
            <div class="d-flex flex-column gap-4">
              <div class="d-flex justify-between align-center">
                <v-icon size="48" color="#FF007F">mdi-credit-card-outline</v-icon>
                <div class="neo-badge pink text-white font-weight-black"
                  style="background-color: var(--color-pink) !important;">Stripe</div>
              </div>
              <div>
                <h3 class="text-h5 font-weight-black mb-2">{{ $t('support.stripe') }}</h3>
                <p class="text-body-1 text-dark-gray font-weight-bold">
                  {{ $t('support.stripeDesc') }}
                </p>
              </div>
            </div>
            <div>
              <v-btn class="neo-btn pink w-100 mx-0 my-0 d-flex align-center justify-center gap-2"
                style="min-height: 52px; height: 52px;" href="https://donate.stripe.com/9B6eVe3cYfsLftl03WejK00"
                target="_blank" id="stripe-btn">
                {{ $t('support.stripeBtn') }} <v-icon class="ml-2">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </div> -->
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()

useHead({
  title: computed(() => `${t('header.title')} | ${t('support.title')}`),
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'description', content: computed(() => t('support.desc')) },
    { property: 'og:title', content: computed(() => `${t('header.title')} | ${t('support.title')}`) },
    { property: 'og:description', content: computed(() => t('support.desc')) },
    { name: 'twitter:title', content: computed(() => `${t('header.title')} | ${t('support.title')}`) },
    { name: 'twitter:description', content: computed(() => t('support.desc')) }
  ]
})
</script>

<style scoped>
.neo-btn.grab {
  background-color: var(--color-grab) !important;
  color: var(--color-white) !important;
  min-height: 64px;
  margin: 12px;
}

.support-page {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.payment-option {
  background-color: var(--color-white);
  transition: all 0.2s ease-in-out;
}

.payment-option.hover-grab:hover {
  border-color: var(--color-grab) !important;
  box-shadow: 10px 10px 0px 0px var(--color-grab) !important;
}

.payment-option.hover-pink:hover {
  border-color: var(--color-pink) !important;
  box-shadow: 10px 10px 0px 0px var(--color-pink) !important;
}

.flex-basis-0 {
  flex-basis: 0;
}

.max-width-600 {
  max-width: 600px;
}
</style>
