<template>
  <div class="index-page">
    <!-- Landing State -->
    <div v-if="state === 'landing'" class="landing-state d-flex flex-column align-center justify-center">
      <div class="text-center mb-10 max-width-600">
        <h2 class="text-h3 font-weight-black mb-4">{{ $t('landing.headline') }}</h2>
        <p class="text-h6 font-weight-bold text-dark-gray">
          {{ $t('landing.tagline') }}
        </p>
      </div>

      <div class="buttons-grid">
        <!-- Button 1: Upload Image -->
        <button class="neo-card neo-large-btn teal" @click="triggerFileInput" :disabled="isLimitExceeded">
          <v-icon size="64" class="mb-4">mdi-image-plus</v-icon>
          <span class="btn-title">{{ $t('landing.uploadReceipt') }}</span>
          <span class="btn-subtitle">{{ $t('landing.fromLibrary') }}</span>
        </button>

        <!-- Button 2: Open Camera -->
        <button class="neo-card neo-large-btn pink" @click="startCamera" :disabled="isLimitExceeded">
          <v-icon size="64" class="mb-4">mdi-camera</v-icon>
          <span class="btn-title">{{ $t('landing.openCamera') }}</span>
          <span class="btn-subtitle">{{ $t('landing.captureLive') }}</span>
        </button>
      </div>

      <!-- Limit warning -->
      <div v-if="isLimitExceeded" class="neo-card p-4 mt-6 d-flex align-center gap-4 bg-white"
        style="max-width: 600px; border-color: var(--color-pink) !important;">
        <v-icon color="#FF007F" size="32">mdi-alert-decagram</v-icon>
        <div class="ml-4">
          <div class="font-weight-black text-pink-color">{{ $t('landing.dailyLimitTitle') }}</div>
          <div class="text-caption">{{ $t('landing.dailyLimitText') }}</div>
        </div>
      </div>

      <!-- Hidden inputs for file trigger and mobile camera capture fallback -->
      <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.bmp,image/jpeg,image/png,image/bmp" class="d-none"
        @change="handleFileChange" />

      <!-- Settings warning if API Key not found -->
      <div v-if="!hasApiKey" class="neo-card p-4 mt-10 d-flex align-center gap-4">
        <v-icon color="#FF007F" size="32">mdi-alert-decagram</v-icon>
        <div class="ml-4">
          <div class="font-weight-black">{{ $t('landing.noApiKeyTitle') }}</div>
          <div class="text-caption">
            {{ $t('landing.noApiKeyText') }}
          </div>
        </div>
      </div>
    </div>

    <!-- WebRTC In-App Camera View -->
    <div v-else-if="state === 'camera'" class="camera-state neo-card p-6">
      <div class="d-flex justify-between align-center mb-4">
        <h3 class="text-h5 font-weight-black">{{ $t('camera.title') }}</h3>
        <v-btn class="neo-btn navy" @click="stopCamera">{{ $t('camera.cancel') }}</v-btn>
      </div>

      <div class="video-container neo-border mb-6">
        <video ref="videoElement" autoplay playsinline class="w-100 h-100"></video>
        <div class="scanline"></div>
      </div>

      <div class="d-flex justify-center gap-4">
        <v-btn class="neo-btn teal px-8 py-4 text-h6" @click="captureFrame">
          <v-icon class="mr-2">mdi-camera-iris</v-icon> {{ $t('camera.capture') }}
        </v-btn>
      </div>
      <canvas ref="canvasElement" class="d-none"></canvas>
    </div>

    <!-- Loading / OCR Processing State -->
    <div v-else-if="state === 'processing'"
      class="processing-state d-flex flex-column align-center justify-center py-12">
      <div class="neo-card p-8 text-center bg-white max-width-800">
        <div class="loading-scanner mb-6">
          <div v-if="imagePreview" class="image-wrap neo-border">
            <img :src="imagePreview" alt="Receipt Preview" />
            <div class="scanner-bar"></div>
          </div>
          <v-progress-linear color="#FF007F" indeterminate height="10" class="neo-border mt-6"></v-progress-linear>
        </div>
        <h3 class="text-h4 font-weight-black mb-2 animate-pulse">{{ $t('processing.title') }}</h3>
        <p class="font-weight-bold text-dark-gray">{{ $t('processing.subtitle') }}</p>
      </div>
    </div>

    <!-- Interactive Splitting State -->
    <div v-else-if="state === 'splitting'" class="splitting-state">
      <div class="d-flex flex-column flex-md-row gap-6">
        <!-- Left Side: Receipt Items list -->
        <div class="flex-grow-1 flex-basis-0 w-100">
          <div class="neo-card p-6 bg-white height-100">
            <div class="d-flex justify-between align-center mb-6 border-b pb-4">
              <div>
                <h3 class="text-h5 font-weight-black mb-1">
                  {{ receiptData.merchantName || $t('splitting.defaultMerchant') }}
                </h3>
                <div v-if="receiptData.googleMapsUrl" class="mb-2">
                  <a :href="receiptData.googleMapsUrl" target="_blank" rel="noopener noreferrer" class="text-decoration-none font-weight-black text-caption d-inline-flex align-center gap-1 map-link" :title="$t('splitting.viewMap')" :aria-label="$t('splitting.viewMap')">
                    <v-icon color="#FF007F" class="map-marker-icon" size="18">mdi-map-marker</v-icon>
                    <span>{{ $t('splitting.viewMap') }}</span>
                  </a>
                </div>
                <p class="text-caption text-dark-gray mb-0">
                  <span v-if="receiptData.date" class="mr-2">📅 {{ receiptData.date }}</span>
                </p>
              </div>
              <div>
                <v-btn class="neo-btn pink" @click="newBill">
                  <v-icon class="mr-1">mdi-arrow-left</v-icon> {{ $t('splitting.newBill') }}</v-btn>
              </div>

            </div>

            <!-- List of Items -->
            <div class="items-list d-flex flex-column gap-4">
              <div v-for="(item, idx) in receiptData.items" :key="idx"
                class="item-row neo-card p-4 d-flex align-center justify-between transition-all"
                :class="{ 'selected-neo-card': selectedQuantities[idx] > 0 }">
                <!-- Selection Details -->
                <div class="d-flex align-center gap-4 flex-grow-1">
                  <div>
                    <div class="font-weight-black text-body-1">{{ item.name }}</div>
                    <div class="text-caption text-dark-gray">
                      {{ formatCurrency(item.price, receiptData.currency) }} {{ $t('splitting.each') }} × {{
                        item.quantity }}
                      <span v-if="item.discount > 0" class="d-block text-pink-color font-weight-bold">
                        {{ $t('splitting.itemDiscount') }}: -{{ formatCurrency(item.discount, receiptData.currency) }}
                      </span>
                    </div>
                    <div class="neo-card d-flex align-center bg-white" style="width: 148px">
                      <button class="stepper-btn" @click="decrementQty(idx)">-</button>
                      <span class="stepper-val">{{ selectedQuantities[idx] }}</span>
                      <button class="stepper-btn" @click="incrementQty(idx, item.quantity)">+</button>
                    </div>
                    <div v-if="item.quantity === 1" class="mt-2 d-flex align-center gap-2 flex-wrap">
                      <label class="neo-checkbox-container">
                        <input type="checkbox" v-model="splitSettings[idx].enabled" class="neo-checkbox" />
                        <span class="font-weight-bold text-caption ml-1">{{ $t('splitting.splitEvenly') }}</span>
                      </label>
                      <div v-if="splitSettings[idx].enabled" class="d-flex align-center gap-1">
                        <span class="text-caption font-weight-bold ml-1">{{ $t('splitting.into') }}</span>
                        <input type="number" v-model.number="splitSettings[idx].parts" class="neo-parts-input ml-1"
                          @input="sanitizeParts(idx)" />
                        <span class="text-caption font-weight-bold ml-1">{{ $t('splitting.parts') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center gap-4">
                  <div class="text-right font-weight-black min-w-80">
                    <div :class="selectedQuantities[idx] > 0 ? 'text-teal-color' : 'text-dark-gray'">
                      {{ formatCurrency(getItemShare(item, idx).total, receiptData.currency) }}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-grow-1 flex-basis-0 w-100">
          <div class="neo-card p-6 bg-primary mb-6">
            <h3 class="text-h4 font-weight-black mb-6 text-center text-white">{{ $t('splitting.yourDebt') }}</h3>

            <div class="calc-table mb-6">
              <div class="d-flex justify-between py-2 border-b text-navy font-weight-bold">
                <span>{{ $t('splitting.itemSubtotal') }}: {{ formatCurrency(calcs.selectedSubtotal,
                  receiptData.currency)
                  }}</span>
              </div>
              <div v-if="calcs.myIndividualDiscount > 0" class="d-flex justify-between py-2 border-b">
                <span>{{ $t('splitting.itemDiscounts') }}:</span>
                <span class="ml-1">- {{ formatCurrency(calcs.myIndividualDiscount, receiptData.currency) }}</span>
              </div>
              <!-- Always show Tax Share even if it is 0 -->
              <div class="d-flex justify-between py-2 border-b">
                <span>{{ $t('splitting.taxShare', { rate: (receiptData.taxRate * 100).toFixed(1) }) }}: </span>
                <span v-if="!receiptData.isTaxInItem">+ {{ formatCurrency(calcs.myIndividualTax, receiptData.currency)
                }}</span>
                <span class="ml-1" v-if="receiptData.isTaxInItem">{{ $t('splitting.taxIncluded') }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b" v-if="receiptData.serviceCharge > 0">
                <span>{{ $t('splitting.serviceCharge', { rate: (receiptData.serviceChargeRate * 100).toFixed(1) }) }}: +
                  {{
                    formatCurrency(calcs.myIndividualServiceCharge, receiptData.currency) }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b" v-if="receiptData.discount > 0">
                <span>{{ $t('splitting.globalDiscount', { rate: (receiptData.discountRate * 100).toFixed(1) }) }}: - {{
                  formatCurrency(calcs.myGlobalDiscount, receiptData.currency) }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b align-center text-navy font-weight-black">
                <span class="text-h5">{{ $t('splitting.meOwe') }} : {{ formatCurrency(calcs.myTotal,
                  receiptData.currency)
                  }}</span>
              </div>
            </div>

            <div class="d-flex flex-column gap-3">
              <v-btn class="neo-btn teal font-weight-black w-80" @click="shareDebt">
                <v-icon class="mr-2">mdi-share</v-icon> {{ $t('splitting.shareMyDebt') }}
              </v-btn>
              <v-btn class="neo-btn font-weight-black w-80" @click="showShareDialog = true">
                <v-icon class="mr-2">mdi-share-variant</v-icon> {{ $t('splitting.shareBill') }}
              </v-btn>
              <v-btn class="neo-btn w-80 py-4" @click="resetSplits">
                <v-icon class="mr-2">mdi-restore</v-icon> {{ $t('splitting.resetSelection') }}
              </v-btn>
            </div>
          </div>

          <div class="neo-card p-6 bg-white">
            <h4 class="text-h6 font-weight-black mb-4">{{ $t('splitting.receiptOverall') }}:</h4>
            <div class="d-flex justify-between py-1 text-body-2">
              <span>{{ $t('splitting.itemSubtotal') }}:</span>
              <span class="font-weight-bold">{{ formatCurrency(receiptData.subtotal, receiptData.currency) }}</span>
            </div>
            <div class="d-flex justify-between py-1 text-body-2" v-if="receiptData.serviceCharge > 0">
              <span>{{ $t('splitting.overallServiceCharge') }}:</span>
              <span class="font-weight-bold">{{ formatCurrency(receiptData.serviceCharge, receiptData.currency)
                }}</span>
            </div>
            <!-- Always show tax even if it is 0 -->
            <div class="d-flex justify-between py-1 text-body-2">
              <span>{{ $t('splitting.overallTax') }}:</span>
              <span class="font-weight-bold">{{ formatCurrency(receiptData.tax, receiptData.currency) }}</span>
            </div>
            <div class="d-flex justify-between py-1 text-body-2" v-if="receiptData.discount > 0">
              <span>{{ $t('splitting.overallGlobalDiscount') }}:</span>
              <span class="font-weight-bold">{{ formatCurrency(receiptData.discount, receiptData.currency) }}</span>
            </div>
            <div class="d-flex justify-between py-2 mt-2 border-t font-weight-black">
              <span>{{ $t('splitting.grandTotal') }}:</span>
              <span>{{ formatCurrency(receiptData.total, receiptData.currency) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Bill Options Dialog -->
    <ShareBillDialog v-model="showShareDialog" @select="shareBill" />
  </div>
</template>

<script setup>
import { ref, computed, inject, onBeforeUnmount, watch, onMounted, nextTick } from 'vue'
import { formatCurrency, fileToBase64, safeBtoa, safeAtob, saveBillToHistory } from '~/utils/helpers'

const { t } = useI18n()


const state = ref('landing') // 'landing' | 'camera' | 'processing' | 'splitting'
const imagePreview = ref('')
const fileInput = ref(null)
const videoElement = ref(null)
const canvasElement = ref(null)
let streamInstance = null

// Form State
const receiptData = ref({
  merchantName: '',
  date: '',
  currency: 'USD',
  items: [],
  tax: 0,
  serviceCharge: 0,
  discount: 0,
  subtotal: 0,
  total: 0,
  googleMapsUrl: ''
})
const selectedQuantities = ref({}) // idx -> quantity
const splitSettings = ref({}) // idx -> { enabled: boolean, parts: number }
const defaultSplitParts = ref(2)
const firstCustomizedIdx = ref(null)
const showShareDialog = ref(false)

// Global injected values from app.vue
const globalApiKey = inject('globalApiKey', ref(''))
const showNotification = inject('showNotification', () => { })

const hasApiKey = computed(() => {
  return !!globalApiKey.value
})

// Usage Tracking (Max 3 receipts/day in production)
const processedCountToday = ref(0)

const isLimitExceeded = computed(() => {
  if (import.meta.dev) return false
  if (globalApiKey.value.length > 11) return false // Bypass limit if custom API Key is provided
  return processedCountToday.value >= 3
})

const checkUsageLimit = () => {
  if (process.client) {
    const today = new Date().toISOString().split('T')[0]
    const trackingStr = localStorage.getItem('usage_tracking')
    if (trackingStr) {
      const [date, countStr] = trackingStr.split('_')
      if (date === today) {
        processedCountToday.value = parseInt(countStr, 10) || 0
        return
      }
    }
    localStorage.setItem('usage_tracking', `${today}_0`)
    processedCountToday.value = 0
  }
}

const incrementUsageLimit = () => {
  if (process.client) {
    const today = new Date().toISOString().split('T')[0]
    const newCount = processedCountToday.value + 1
    processedCountToday.value = newCount
    localStorage.setItem('usage_tracking', `${today}_${newCount}`)
  }
}

onMounted(() => {
  checkUsageLimit()
})

// Trigger Hidden File Upload
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Handle Local File Selection
const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    state.value = 'processing'
    const base64Image = await fileToBase64(file)
    imagePreview.value = base64Image
    await processReceipt(base64Image)
  } catch (err) {
    showNotification(t('notifications.errorLoading', { error: err.message }), true)
    state.value = 'landing'
  }
}

// In-app WebRTC Camera Controls
const startCamera = async () => {
  state.value = 'camera'
  // Wait a tick for element rendering
  await nextTick()
  try {
    streamInstance = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    })
    if (videoElement.value) {
      videoElement.value.srcObject = streamInstance
    }
  } catch (err) {
    showNotification(t('notifications.cameraAccessError'), true)
    state.value = 'landing'
    // Fallback to triggering file upload directly
    triggerFileInput()
  }
}

const stopCamera = () => {
  if (streamInstance) {
    streamInstance.getTracks().forEach(track => track.stop())
    streamInstance = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  state.value = 'landing'
}

onBeforeUnmount(() => {
  if (streamInstance) {
    streamInstance.getTracks().forEach(track => track.stop())
  }
})

// Capture snapshot from stream
const captureFrame = () => {
  if (!videoElement.value || !canvasElement.value) return

  const video = videoElement.value
  const canvas = canvasElement.value
  const ctx = canvas.getContext('2d')

  // Set canvas size to match video aspect ratio
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const base64Data = canvas.toDataURL('image/jpeg', 0.9)
  imagePreview.value = base64Data

  // Stop camera streaming right away
  stopCamera()
  state.value = 'processing'

  processReceipt(base64Data)
}

// Call API server route
const processReceipt = async (base64Str) => {
  try {
    const response = await $fetch('/api/process-receipt', {
      method: 'POST',
      body: {
        image: base64Str,
        apiKey: globalApiKey.value
      }
    })

    if (response.success && response.data) {
      receiptData.value = response.data

      // Initialize checklist quantities to 0
      selectedQuantities.value = {}
      splitSettings.value = {}
      for (let i = 0; i < response.data.items.length; i++) {
        selectedQuantities.value[i] = 0
        splitSettings.value[i] = { enabled: false, parts: defaultSplitParts.value }
      }

      // Increment usage count tracking
      incrementUsageLimit()

      // Save to history
      saveBillToHistory(response.data)

      state.value = 'splitting'
      showNotification(t('notifications.processingSuccess'))
    } else {
      throw new Error(response.error || 'Parsing error')
    }
  } catch (err) {
    if (err.message === 'NOT_A_RECEIPT') {
      incrementUsageLimit()
    }
    const errMsg = err.message === 'NOT_A_RECEIPT'
      ? t('notifications.notAReceipt')
      : (err.message || t('notifications.processingError'))
    showNotification(errMsg, true)
    state.value = 'landing'
  }
}


const incrementQty = (idx, maxQty) => {
  if (selectedQuantities.value[idx] < maxQty) {
    selectedQuantities.value[idx] = Number((selectedQuantities.value[idx] + 1).toFixed(1))
  }
}

const decrementQty = (idx) => {
  if (selectedQuantities.value[idx] > 1) {
    selectedQuantities.value[idx] = Number((selectedQuantities.value[idx] - 1).toFixed(1))
  } else {
    selectedQuantities.value[idx] = 0
  }
}

// Reset calculations
const clearSelections = () => {
  defaultSplitParts.value = 2
  firstCustomizedIdx.value = null
  selectedQuantities.value = {}
  splitSettings.value = {}
}

const resetSplits = () => {
  defaultSplitParts.value = 2
  firstCustomizedIdx.value = null
  for (const idx in selectedQuantities.value) {
    selectedQuantities.value[idx] = 0
    if (splitSettings.value[idx]) {
      splitSettings.value[idx].enabled = false
      splitSettings.value[idx].parts = 2
    }
  }
  showNotification(t('notifications.debtReset'))
}

// Reset bill state and clear query params
const newBill = () => {
  const router = useRouter()
  router.replace({
    query: {
      ...route.query,
      bill: undefined
    }
  })

  state.value = 'landing'
  receiptData.value = {
    merchantName: '',
    date: '',
    currency: 'USD',
    items: [],
    tax: 0,
    serviceCharge: 0,
    discount: 0,
    subtotal: 0,
    total: 0,
    googleMapsUrl: ''
  }
  clearSelections()
}

const getItemShare = (item, idx) => {
  const qty = selectedQuantities.value[idx] || 0
  if (qty <= 0) {
    return { quantity: 0, cost: 0, discount: 0, total: 0, isSplit: false, parts: 1 }
  }
  let effectiveQty = qty
  const isSplit = item.quantity === 1 && splitSettings.value[idx]?.enabled
  const parts = isSplit ? Math.max(2, parseInt(splitSettings.value[idx]?.parts, 10) || 2) : 1
  if (isSplit) {
    effectiveQty = 1 / parts
  }
  const cost = item.price * effectiveQty
  const discount = (item.discount || 0) * (effectiveQty / item.quantity)
  return {
    quantity: effectiveQty,
    cost,
    discount,
    total: cost - discount,
    isSplit,
    parts
  }
}

const sanitizeParts = (idx) => {
  if (splitSettings.value[idx]) {
    let val = parseInt(splitSettings.value[idx].parts, 10)
    if (isNaN(val)) {
      splitSettings.value[idx].parts = 0
    } else {
      splitSettings.value[idx].parts = val
      if (val >= 2) {
        if (firstCustomizedIdx.value === null) {
          firstCustomizedIdx.value = idx
          defaultSplitParts.value = val
          // Update all other non-enabled items to use this new default parts
          for (const i in splitSettings.value) {
            if (String(i) !== String(idx) && !splitSettings.value[i].enabled) {
              splitSettings.value[i].parts = val
            }
          }
        } else if (firstCustomizedIdx.value === idx) {
          defaultSplitParts.value = val
          // Keep updating other non-enabled items in case of correction
          for (const i in splitSettings.value) {
            if (String(i) !== String(idx) && !splitSettings.value[i].enabled) {
              splitSettings.value[i].parts = val
            }
          }
        }
      }
    }
  }
}

// Calculations Computed Property (optimized in single-pass loop)
const calcs = computed(() => {
  const items = receiptData.value?.items || []
  let myItemSubtotal = 0
  let myIndividualDiscount = 0
  let myIndividualTax = 0
  let myIndividualServiceCharge = 0
  let myGlobalDiscount = 0

  let receiptItemSubtotal = 0
  const selectedItemBreakdown = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    receiptItemSubtotal += item.price * item.quantity

    const share = getItemShare(item, i)
    if (share.quantity > 0) {
      const itemCost = share.cost
      const itemDiscount = share.discount
      const itemTax = itemCost * (receiptData.value?.taxRate || 0)
      const itemServiceCharge = itemCost * (receiptData.value?.serviceChargeRate || 0)
      const itemGlobalDiscount = itemCost * (receiptData.value?.discountRate || 0)

      myItemSubtotal += itemCost
      myIndividualDiscount += itemDiscount
      myIndividualTax += itemTax
      myIndividualServiceCharge += itemServiceCharge
      myGlobalDiscount += itemGlobalDiscount

      selectedItemBreakdown.push({
        name: item.name,
        quantity: share.quantity,
        price: item.price,
        discount: itemDiscount,
        globalDiscount: itemGlobalDiscount,
        serviceCharge: itemServiceCharge,
        totalPrice: itemCost + itemTax + itemServiceCharge - itemDiscount - itemGlobalDiscount,
        isSplit: share.isSplit,
        parts: share.parts
      })
    }
  }

  const tax = receiptData.value?.tax || 0
  const serviceCharge = receiptData.value?.serviceCharge || 0
  const myTax = tax
  const myServiceCharge = serviceCharge
  const myTotal = myItemSubtotal - myIndividualDiscount + myIndividualTax + myIndividualServiceCharge - myGlobalDiscount

  return {
    selectedSubtotal: myItemSubtotal,
    myIndividualDiscount,
    myIndividualTax,
    myIndividualServiceCharge,
    receiptItemSubtotal,
    myTax,
    myServiceCharge,
    myGlobalDiscount,
    myTotal,
    selectedItemBreakdown
  }
})

// Copy Split Summary text to clipboard
// Share Split Summary and generate encoded join link
const shareDebt = async () => {
  const details = calcs.value
  if (details.selectedItemBreakdown.length === 0) {
    showNotification(t('notifications.selectItemFirst'), true)
    return
  }

  const currency = receiptData.value.currency
  const merchant = receiptData.value.merchantName || 'Restaurant'

  let text = `🔪 ME @ ${merchant.toUpperCase()}\n`
  if (receiptData.value.date) {
    text += `📅 ${receiptData.value.date}\n`
  }
  text += `======================\n`
  details.selectedItemBreakdown.forEach(item => {
    if (item.isSplit) {
      text += `• ${item.name} (Split 1/${item.parts} @ ${formatCurrency(item.price, currency)}): ${formatCurrency(item.totalPrice, currency)}\n`
    } else {
      let singleItemSummary = item.quantity === 1 ? '' : `(${item.quantity}x @ ${formatCurrency(item.price, currency)})`
      text += `• ${item.name} ${singleItemSummary}: ${formatCurrency(item.totalPrice, currency)}\n`
    }
    if (item.discount > 0) {
      text += `  ${t('splitting.itemDiscount')}: -${formatCurrency(item.discount, currency)}\n`
    }
  })
  text += `-----------------------------------\n`
  text += `${t('splitting.itemSubtotal')}: ${formatCurrency(details.selectedSubtotal, currency)}\n`
  if (details.myIndividualDiscount > 0) {
    text += `${t('splitting.itemDiscounts')}: -${formatCurrency(details.myIndividualDiscount, currency)}\n`
  }
  if (details.myIndividualTax > 0) {
    text += `${t('splitting.taxShare', { rate: (receiptData.value.taxRate * 100).toFixed(1) })}: +${formatCurrency(details.myIndividualTax, currency)}\n`
  }
  if (details.myIndividualServiceCharge > 0) {
    text += `${t('splitting.serviceCharge', { rate: (receiptData.value.serviceChargeRate * 100).toFixed(1) })}: +${formatCurrency(details.myIndividualServiceCharge, currency)}\n`
  }
  if (details.myGlobalDiscount > 0) {
    text += `${t('splitting.globalDiscount', { rate: (receiptData.value.discountRate * 100).toFixed(1) })}: -${formatCurrency(details.myGlobalDiscount, currency)}\n`
  }
  text += `======================\n`
  text += `💸 ${t('splitting.meOwe')}: ${formatCurrency(details.myTotal, currency)}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: `My debt at ${merchant}`,
        text: text
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        showNotification('Could not share. Try copying instead.', true)
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(text)
      showNotification(t('notifications.summaryCopied'))
    } catch (err) {
      showNotification(t('notifications.failedCopyClipboard'), true)
    }
  }
}

// Share overall Bill and generate encoded join link
const shareBill = async (withPresets = false) => {
  const currency = receiptData.value.currency
  const merchant = receiptData.value.merchantName || 'Restaurant'

  // Generate the sharing URL with the base64-encoded JSON payload
  let shareUrl = ''
  try {
    const payloadObj = { ...receiptData.value }
    if (withPresets) {
      payloadObj.splitSettings = splitSettings.value
    } else {
      delete payloadObj.splitSettings
    }
    const payload = JSON.stringify(payloadObj)
    const encoded = safeBtoa(payload)
    shareUrl = `${window.location.origin}${window.location.pathname}?bill=${encoded}`
  } catch (err) {
    showNotification(t('notifications.failedGenerateShareUrl'), true)
    return
  }

  let text = `🧾 BILL FROM ${merchant.toUpperCase()}\n`
  if (receiptData.value.date) {
    text += `📅 ${receiptData.value.date}\n`
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Bill at ${merchant}`,
        text: text,
        url: shareUrl
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        showNotification('Could not share. Try copying instead.', true)
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
      showNotification(t('notifications.billCopied'))
    } catch (err) {
      showNotification(t('notifications.failedCopyClipboard'), true)
    }
  }
}

// Load shared bill if ?bill=XXX parameter is present or changes
const route = useRoute()
watch(
  () => route.query.bill,
  (billParam) => {
    if (billParam) {
      try {
        const decodedJson = safeAtob(billParam)
        if (decodedJson) {
          const data = JSON.parse(decodedJson)
          if (data && data.items) {
            receiptData.value = data
            // Initialize checklist quantities to 0
            selectedQuantities.value = {}
            splitSettings.value = {}
            for (let i = 0; i < data.items.length; i++) {
              selectedQuantities.value[i] = 0
              const preset = data.splitSettings && data.splitSettings[i]
              splitSettings.value[i] = preset || { enabled: false, parts: defaultSplitParts.value }
              if (preset && preset.enabled && firstCustomizedIdx.value === null) {
                firstCustomizedIdx.value = i
                defaultSplitParts.value = preset.parts
              }
            }
            state.value = 'splitting'
          }
        }
      } catch (err) {
        showNotification(t('notifications.invalidSharedBill'), true)
      }
    }
  },
  { immediate: true }
)

// Watch splitSettings to handle resetting firstCustomizedIdx if it gets disabled
watch(
  () => splitSettings.value,
  (newSettings) => {
    if (firstCustomizedIdx.value !== null) {
      const item = newSettings[firstCustomizedIdx.value]
      if (!item || !item.enabled) {
        firstCustomizedIdx.value = null
      }
    }
  },
  { deep: true }
)
</script>



<style scoped>
.max-width-600 {
  max-width: 600px;
}

.max-width-500 {
  max-width: 500px;
}

/* Button grids */
.buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .buttons-grid {
    grid-template-columns: 1fr;
  }
}

.neo-large-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  cursor: pointer;
  outline: none;
}

.neo-large-btn.teal {
  background-color: var(--color-teal) !important;
}

.neo-large-btn.pink {
  background-color: var(--color-pink) !important;
  color: var(--color-white) !important;
}

.btn-title {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.btn-subtitle {
  font-size: 0.85rem;
  font-weight: 700;
  opacity: 0.8;
  text-transform: uppercase;
}

/* Camera Live Styles */
.video-container {
  position: relative;
  width: 100%;
  max-height: 480px;
  background-color: #000;
  overflow: hidden;
}

.scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background: rgba(0, 245, 212, 0.4);
  box-shadow: 0 0 10px 4px rgba(0, 245, 212, 0.6);
  animation: scan 2.5s linear infinite;
  pointer-events: none;
}

@keyframes scan {
  0% {
    top: 0%;
  }

  100% {
    top: 100%;
  }
}

/* Loading Scanner Styles */
.loading-scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrap {
  position: relative;
  max-width: 250px;
  overflow: hidden;
}

.image-wrap img {
  width: 100%;
  height: auto;
  display: block;
}

.scanner-bar {
  position: absolute;
  width: 100%;
  height: 4px;
  background-color: var(--color-pink);
  box-shadow: 0 0 8px 2px var(--color-pink);
  animation: scan-vertical 2s ease-in-out infinite alternate;
}

@keyframes scan-vertical {
  0% {
    top: 0%;
  }

  100% {
    top: 100%;
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Splitting Checklist Styles */
.min-w-80 {
  min-width: 80px;
}

.bg-navy-light {
  background-color: #F8FAFC;
}

.text-pink-color {
  color: var(--color-pink);
}

.text-teal-color {
  color: #0E9080;
  /* Darker teal for readability */
}

/* Quantity stepper */
.stepper {
  height: 40px;
}

.stepper-btn {
  width: 48px;
  height: 100%;
  font-size: 1.8rem;
  font-weight: 900;
  border: none;
  background: var(--color-gray);
  color: var(--color-navy);
  cursor: pointer;
  transition: background-color 0.15s;
}

.stepper-btn:hover {
  background-color: #E2E8F0;
}

.stepper-val {
  padding: 0 12px;
  font-weight: 800;
  font-size: 1rem;
}

.neo-checkbox-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.neo-checkbox {
  width: 18px;
  height: 18px;
  appearance: none;
  background-color: var(--color-white);
  border: 2px solid var(--color-navy);
  box-shadow: 2px 2px 0px 0px var(--color-navy);
  cursor: pointer;
  position: relative;
  outline: none;
  transition: all 0.1s ease;
  vertical-align: middle;
}

.neo-checkbox:checked {
  background-color: var(--color-pink);
}

.neo-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid var(--color-white);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.neo-parts-input {
  width: 60px;
  height: 28px;
  padding: 0 4px;
  background-color: var(--color-white);
  border: 2px solid var(--color-navy) !important;
  border-radius: 4px !important;
  color: var(--color-navy) !important;
  font-weight: 800;
  font-size: 0.85rem;
  text-align: center;
  outline: none;
}

.neo-parts-input:focus {
  box-shadow: 2px 2px 0px 0px var(--color-navy);
}

.map-link {
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.map-link:hover {
  transform: translateY(-2px) scale(1.1);
}

.map-marker-icon {
  transition: color 0.2s ease;
}

.map-link:hover .map-marker-icon {
  color: var(--color-teal) !important;
}
</style>
