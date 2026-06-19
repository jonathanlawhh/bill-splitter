<template>
  <main class="manual-page">
    <div class="d-flex flex-column ga-6">
      <!-- Top Bar / Navigation -->
      <div class="d-flex justify-start">
        <v-btn class="neo-btn navy" to="/" id="back-home-btn">
          <v-icon class="mr-2">mdi-arrow-left</v-icon> {{ $t('manual.cancelBtn') }}
        </v-btn>
      </div>

      <div class="d-flex flex-column flex-md-row ga-6">
        <!-- Left Side: Receipt Details & Items -->
        <div class="flex-grow-2 flex-basis-0 w-100">
          <!-- Global Info Card -->
          <div class="neo-card p-6">
            <h2 class="font-weight-black mb-1">{{ $t('manual.title') }}</h2>

            <div class="form-grid mb-6">
              <div>
                <label class="d-block font-weight-bold mb-2">{{ $t('manual.merchantName') }}</label>
                <input v-model="merchantName" type="text" placeholder="e.g. Starbucks" class="neo-input" />
              </div>
              <div>
                <label class="d-block font-weight-bold mb-2">{{ $t('manual.merchantLocation') }}</label>
                <input v-model="merchantLocation" type="text" placeholder="e.g. Mid Valley, KL" class="neo-input" />
              </div>
              <div>
                <label class="d-block font-weight-bold mb-2">{{ $t('manual.date') }}</label>
                <input v-model="receiptDate" type="date" class="neo-input" />
              </div>
              <div>
                <label class="d-block font-weight-bold mb-2">{{ $t('manual.currency') }}</label>
                <input v-model="currency" list="currencies" placeholder="e.g. USD, RM, $" class="neo-input" />
                <datalist id="currencies">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CNY">CNY (CN¥)</option>
                  <option value="HKD">HKD (HK$)</option>
                  <option value="SGD">SGD (SG$)</option>
                  <option value="MYR">MYR (RM)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CHF">CHF (CHF)</option>
                  <option value="PHP">PHP (₱)</option>
                  <option value="IDR">IDR (Rp)</option>
                  <option value="THB">THB (฿)</option>
                  <option value="VND">VND (₫)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="TWD">TWD (NT$)</option>
                  <option value="NZD">NZD (NZ$)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="MXN">MXN (MX$)</option>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="SAR">SAR (SR)</option>
                </datalist>
              </div>
            </div>
          </div>

          <!-- Items Card -->
          <div class="neo-card p-6 mt-6">
            <div class="d-flex justify-between align-center mb-6">
              <h3 class="font-weight-black m-0">{{ $t('manual.items') }}</h3>
              <button class="neo-btn teal neo-btn-sm font-weight-black" @click="addItem">
                <v-icon class="mr-1" size="16">mdi-plus</v-icon> {{ $t('manual.addItem') }}
              </button>
            </div>

            <!-- Headers (Desktop only) -->
            <div class="d-none d-md-flex align-center ga-3 mb-2 px-1 text-subtitle-2 font-weight-black">
              <div class="flex-grow-1">{{ $t('manual.itemName') }}</div>
              <div style="width: 80px;" class="text-center">{{ $t('manual.qty') }}</div>
              <div style="width: 110px;" class="text-right">{{ $t('manual.price') }}</div>
              <div style="width: 48px;"></div>
            </div>

            <!-- List of Items -->
            <div class="items-container d-flex flex-column ga-4">
              <div v-for="(item, idx) in items" :key="idx" class="item-entry-row d-flex align-center ga-3 pb-3 border-b">
                <div class="flex-grow-1">
                  <label class="text-body-small font-weight-bold d-md-none">{{ $t('manual.itemName') }}</label>
                  <input v-model="item.name" type="text" placeholder="Item name" class="neo-input text-body-2" />
                </div>
                <div style="width: 80px;">
                  <label class="text-body-small font-weight-bold d-md-none">{{ $t('manual.qty') }}</label>
                  <input v-model.number="item.quantity" type="number" min="1" step="any" class="neo-input text-body-2 text-center" />
                </div>
                <div style="width: 110px;">
                  <label class="text-body-small font-weight-bold d-md-none">{{ $t('manual.price') }}</label>
                  <input v-model.number="item.price" type="number" min="0" step="0.01" class="neo-input text-body-2 text-right" />
                </div>
                <div class="d-flex align-center justify-center">
                  <v-btn icon="mdi-trash-can-outline" variant="text" color="#FF007F" @click="removeItem(idx)" :disabled="items.length <= 1" aria-label="Remove Item"></v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Percentages & Live Calculations -->
        <div class="flex-grow-1 flex-basis-0 w-100">
          <!-- Rates and Calculations -->
          <div class="neo-card bg-primary text-white p-6">
            <h4 class="font-weight-black text-center text-white mb-6">{{ $t('splitting.receiptOverall') }}</h4>

            <!-- Rates Fields -->
            <div class="d-flex flex-column ga-4 mb-6">
              <div>
                <label class="d-block font-weight-bold mb-1 text-white">{{ $t('manual.discount') }}</label>
                <input v-model.number="discountPercent" type="number" min="0" max="100" step="any" class="neo-input text-body-2 text-black" />
              </div>
              <div>
                <label class="d-block font-weight-bold mb-1 text-white">{{ $t('manual.tax') }}</label>
                <input v-model.number="taxPercent" type="number" min="0" max="100" step="any" class="neo-input text-body-2 text-black" />
              </div>
              <div>
                <label class="d-block font-weight-bold mb-1 text-white">{{ $t('manual.serviceCharge') }}</label>
                <input v-model.number="serviceChargePercent" type="number" min="0" max="100" step="any" class="neo-input text-body-2 text-black" />
              </div>
            </div>

            <!-- Auto Calculations -->
            <div class="calculations-section mb-6">
              <div class="d-flex justify-between py-2 border-b font-weight-bold text-white">
                <span>{{ $t('manual.subtotal') }}</span>
                <span>{{ formatManualCurrency(totals.subtotal) }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b text-white" v-if="totals.discount > 0">
                <span>{{ $t('manual.totalDiscount') }} ({{ discountPercent }}%)</span>
                <span>- {{ formatManualCurrency(totals.discount) }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b text-white" v-if="totals.tax > 0">
                <span>{{ $t('manual.totalTax') }} ({{ taxPercent }}%)</span>
                <span>+ {{ formatManualCurrency(totals.tax) }}</span>
              </div>
              <div class="d-flex justify-between py-2 border-b text-white" v-if="totals.serviceCharge > 0">
                <span>{{ $t('manual.totalServiceCharge') }} ({{ serviceChargePercent }}%)</span>
                <span>+ {{ formatManualCurrency(totals.serviceCharge) }}</span>
              </div>
              <div class="d-flex justify-between py-3 font-weight-black text-white" style="font-size: 1.25rem;">
                <span>{{ $t('manual.grandTotal') }}</span>
                <span>{{ formatManualCurrency(totals.total) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <v-btn class="neo-btn teal font-weight-black w-100 mx-0 my-2" style="min-height: 52px; height: 52px;" @click="createReceipt">
              <v-icon class="mr-2">mdi-check-bold</v-icon> {{ $t('manual.createBtn') }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { formatCurrency, safeBtoa, saveBillToHistory } from '~/utils/helpers'

const { t } = useI18n()
const router = useRouter()

// Injected notification helper
const showNotification = inject('showNotification', () => {})

// SEO Metadata
useHead({
  title: computed(() => `${t('header.title')} | ${t('manual.title')}`),
  meta: [
    { name: 'description', content: computed(() => t('manual.title')) }
  ]
})

// Form State
const merchantName = ref('')
const merchantLocation = ref('')
const receiptDate = ref(new Date().toISOString().split('T')[0])
const currency = ref('MYR')

const formatManualCurrency = (value) => {
  const numStr = Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${currency.value || 'MYR'} ${numStr}`
}

// Rates
const discountPercent = ref(0)
const taxPercent = ref(0)
const serviceChargePercent = ref(0)

// Items
const items = ref([
  { name: '', quantity: 1, price: 0, discount: 0 }
])

const addItem = () => {
  items.value.push({ name: '', quantity: 1, price: 0, discount: 0 })
}

const removeItem = (idx) => {
  if (items.value.length > 1) {
    items.value.splice(idx, 1)
  }
}

// Live Totals Calculation
const totals = computed(() => {
  const subtotal = items.value.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.price) || 0
    return sum + (qty * price)
  }, 0)

  const discountVal = parseFloat(discountPercent.value) || 0
  const taxVal = parseFloat(taxPercent.value) || 0
  const serviceChargeVal = parseFloat(serviceChargePercent.value) || 0

  const discount = subtotal * (discountVal / 100)
  const tax = subtotal * (taxVal / 100)
  const serviceCharge = subtotal * (serviceChargeVal / 100)
  const total = subtotal - discount + tax + serviceCharge

  return {
    subtotal,
    discount,
    tax,
    serviceCharge,
    total
  }
})

// Create and redirect
const createReceipt = () => {
  // Validate items: at least 1 item with name, qty > 0, price > 0
  const isValid = items.value.length > 0 && items.value.every(item => {
    return item.name.trim() && (parseFloat(item.quantity) > 0) && (parseFloat(item.price) > 0)
  })

  if (!isValid) {
    showNotification(t('manual.validationError'), true)
    return
  }

  // Create formatted receipt payload matching index.vue requirements
  const cleanMerchant = merchantName.value.trim() || 'Manual Receipt'
  const mapsUrl = merchantLocation.value.trim() 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanMerchant + ' ' + merchantLocation.value.trim())}`
    : ''

  const discountVal = parseFloat(discountPercent.value) || 0
  const taxVal = parseFloat(taxPercent.value) || 0
  const serviceChargeVal = parseFloat(serviceChargePercent.value) || 0

  const payload = {
    isReceipt: true,
    merchantName: cleanMerchant,
    date: receiptDate.value,
    currency: currency.value.trim() || 'MYR',
    items: items.value.map(item => ({
      name: item.name.trim(),
      quantity: parseFloat(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      discount: 0
    })),
    tax: totals.value.tax,
    isTaxInItem: false,
    serviceCharge: totals.value.serviceCharge,
    discount: totals.value.discount,
    subtotal: totals.value.subtotal,
    total: totals.value.total,
    googleMapsUrl: mapsUrl || null,
    taxRate: taxVal / 100,
    serviceChargeRate: serviceChargeVal / 100,
    discountRate: discountVal / 100,
    isSharedTax: true,
    isSharedDiscount: true,
    isSharedServiceCharge: true
  }

  // Save to localStorage history
  saveBillToHistory(payload)

  // Redirect to split view with base64 encoded payload
  const encoded = safeBtoa(JSON.stringify(payload))
  router.push(`/?bill=${encoded}`)
  showNotification(t('notifications.processingSuccess'))
}
</script>

<style scoped>
.manual-page {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .item-entry-row {
    flex-wrap: wrap;
    gap: 12px !important;
  }
  .item-entry-row > div {
    width: 100% !important;
  }
}

.items-container {
  max-height: 500px;
  overflow-y: auto;
}

.flex-basis-0 {
  flex-basis: 0;
}

.flex-grow-2 {
  flex-grow: 2;
}

.p-6 {
  padding: 24px;
}

.neo-btn-sm {
  min-height: 36px !important;
  height: 36px !important;
  font-size: 0.75rem !important;
  padding: 0 12px !important;
  margin: 4px 0 !important;
  border-width: 2px !important;
  box-shadow: 3px 3px 0px 0px var(--color-navy) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.neo-btn-sm:hover {
  transform: translate(-1px, -1px) !important;
  box-shadow: 4px 4px 0px 0px var(--color-navy) !important;
}

.neo-btn-sm:active {
  transform: translate(1px, 1px) !important;
  box-shadow: 2px 2px 0px 0px var(--color-navy) !important;
}
</style>
