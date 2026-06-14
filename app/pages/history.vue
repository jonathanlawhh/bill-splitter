<template>
  <main class="history-page">
    <div class="d-flex flex-column ga-6">

      <!-- Top Bar / Navigation -->
      <div class="d-flex flex-column flex-sm-row justify-between ga-4">
        <div>
          <v-btn class="neo-btn navy" to="/" id="back-home-btn">
            <v-icon class="mr-2">mdi-arrow-left</v-icon> {{ $t('history.back') }}
          </v-btn>
        </div>
        <div v-if="historyItems.length > 0">
          <v-btn class="neo-btn pink" @click="showConfirmDeleteAll = true" id="delete-all-btn">
            <v-icon class="mr-2">mdi-delete-sweep</v-icon> {{ $t('history.deleteAll') }}
          </v-btn>
        </div>
      </div>

      <!-- Confirmation Overlay/Card for Delete All -->
      <div v-if="showConfirmDeleteAll" class="neo-card border-pink" id="confirm-delete-all-card">
        <div class="d-flex align-center ga-4 mb-4">
          <v-icon color="#FF007F" size="40">mdi-alert-decagram</v-icon>
          <div>
            <p class="font-weight-black">{{ $t('history.confirmAllTitle') }}</p>
            <p class="text-body-1 font-weight-bold">
              {{ $t('history.confirmAllText') }}
            </p>
          </div>
        </div>
        <div class="d-flex">
          <v-btn class="neo-btn navy" @click="showConfirmDeleteAll = false" id="cancel-delete-all-btn">{{
            $t('history.keepIt') }}</v-btn>
          <v-btn class="neo-btn pink" @click="confirmClearHistory" id="confirm-delete-all-btn">{{
            $t('history.yesDeleteAll') }}</v-btn>
        </div>
      </div>
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="500px">
        <div class="neo-card border-pink" id="confirm-delete-single-dialog" style="margin: 0 !important;">
          <div class="d-flex justify-between align-center mb-4">
            <p class="font-weight-black">{{ $t('history.deleteSingleTitle') }}</p>
          </div>
          <p class="text-body-1 font-weight-bold">
            {{ $t('history.deleteSingleText', { merchant: itemToDelete?.merchantName }) }}
          </p>
          <div class="d-flex justify-end ga-3">
            <v-btn class="neo-btn navy px-6" @click="showDeleteDialog = false" id="cancel-delete-single-btn">{{
              $t('history.cancel') }}</v-btn>
            <v-btn class="neo-btn pink px-6" @click="confirmDeleteSingle" id="confirm-delete-single-btn">{{
              $t('history.delete') }}</v-btn>
          </div>
        </div>
      </v-dialog>

      <!-- Empty State -->
      <div v-if="historyItems.length === 0"
        class="neo-card text-center d-flex flex-column align-center justify-center ga-6" id="empty-state">
        <div>
          <h2 class="font-weight-black mb-2">{{ $t('header.history_description') }}</h2>
          <h3>
            {{ $t('history.emptyText') }}
          </h3>
        </div>
      </div>

      <!-- History List -->
      <div v-else class="history-list d-flex flex-column ga-6" id="history-list">
        <div v-for="group in groupedHistory" :key="group.monthYear" class="d-flex flex-column ga-4">
          <!-- Month/Year Header -->
          <div class="month-group-header">
            <span class="month-title">
              <v-icon color="white" size="small" class="mr-1">mdi-calendar-month</v-icon>
              {{ group.monthYear }}
            </span>
          </div>

          <!-- Cards under this month group -->
          <div v-for="item in group.items" :key="item.index"
            class="history-item-row neo-card bg-white d-flex flex-column flex-sm-row justify-between align-start align-sm-center transition-all cursor-pointer ga-4"
            @click="openBill(item.encoded)" :id="'history-item-' + item.index">

            <!-- Left: Receipt Info -->
            <div class="d-flex align-center ga-4 flex-grow-1">
              <div>
                <p class="font-weight-black">{{ item.merchantName }}</p>
                <div class="text-body-2 font-weight-bold d-flex align-center ga-1">
                  <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                  <span>{{ item.date }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Total & Delete Actions -->
            <div class="d-flex align-center justify-between justify-end w-100 w-sm-auto ga-6">
              <div class="font-weight-black text-navy">
                {{ formatCurrency(item.total, item.currency) }}
              </div>
              <v-btn class="neo-btn pink delete-single-btn" icon="mdi-delete" @click.stop="deleteItem(item)"
                aria-label="Delete bill" :id="'delete-btn-' + item.index">
              </v-btn>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { formatCurrency, safeAtob, getBillHistory, deleteBillFromHistory, clearBillHistory } from '~/utils/helpers'

const { t, locale } = useI18n()

useHead({
  title: computed(() => `${t('header.title')} | ${t('header.history')}`),
  meta: [
    { name: 'description', content: computed(() => t('header.history_description')) },
    // OpenGraph / Facebook
    { property: 'og:title', content: computed(() => `${t('header.title')} | ${t('header.history')}`) },
    { property: 'og:description', content: computed(() => t('header.history_description')) },
    // Twitter Card
    { name: 'twitter:title', content: computed(() => `${t('header.title')} | ${t('header.history')}`) },
    { name: 'twitter:description', content: computed(() => t('header.history_description')) }
  ]
})

const historyItems = ref([])
const showConfirmDeleteAll = ref(false)
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)

const showNotification = inject('showNotification', () => { })

const groupedHistory = computed(() => {
  const groups = []
  historyItems.value.forEach(item => {
    const monthYear = getMonthYear(item.date)
    let group = groups.find(g => g.monthYear === monthYear)
    if (!group) {
      group = {
        monthYear,
        items: []
      }
      groups.push(group)
    }
    group.items.push(item)
  })
  return groups
})

const getMonthYear = (dateStr) => {
  if (!dateStr || dateStr === t('history.unknownDate')) {
    return t('history.unknownDate')
  }

  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const dateObj = new Date(year, month, day)
      return new Intl.DateTimeFormat(locale.value || 'en', { month: 'long', year: 'numeric' }).format(dateObj)
    }
  }

  const dateObj = new Date(dateStr)
  if (isNaN(dateObj.getTime())) {
    return t('history.unknownDate')
  }
  return new Intl.DateTimeFormat(locale.value || 'en', { month: 'long', year: 'numeric' }).format(dateObj)
}

onMounted(() => {
  loadHistory()
})

const loadHistory = () => {
  const rawHistory = getBillHistory()
  historyItems.value = rawHistory.map((encoded, index) => {
    try {
      const decoded = safeAtob(encoded)
      if (!decoded) return null
      const data = JSON.parse(decoded)
      return {
        index,
        encoded,
        data,
        merchantName: data.merchantName || t('history.unknownMerchant'),
        date: data.date || t('history.unknownDate'),
        total: data.total || 0,
        currency: data.currency || 'USD',
        itemsCount: data.items ? data.items.length : 0
      }
    } catch (err) {
      console.error('Failed to parse bill history item', err)
      return null
    }
  }).filter(item => item !== null)
}

const openBill = (encoded) => {
  navigateTo(`/?bill=${encoded}`)
}

const deleteItem = (item) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const confirmDeleteSingle = () => {
  if (itemToDelete.value) {
    deleteBillFromHistory(itemToDelete.value.index)
    loadHistory()
    showNotification(t('notifications.billRemoved'))
  }
  showDeleteDialog.value = false
  itemToDelete.value = null
}

const confirmClearHistory = () => {
  clearBillHistory()
  historyItems.value = []
  showConfirmDeleteAll.value = false
  showNotification(t('notifications.historyCleared'))
}
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.month-group-header {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.month-title {
  background-color: var(--color-navy);
  color: var(--color-white);
  padding: 6px 16px;
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  border: 3px solid var(--color-navy);
  border-radius: 8px;
  box-shadow: 4px 4px 0px 0px var(--color-pink);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
}

.history-item-row:hover {
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0px 0px var(--color-navy) !important;
}

.border-pink {
  border-color: var(--color-pink) !important;
}


.w-sm-auto {
  @media (min-width: 600px) {
    width: auto !important;
  }
}

.delete-single-btn {
  margin: 0 !important;
  min-height: 48px !important;
  height: 48px !important;
  width: 48px !important;
}
</style>
