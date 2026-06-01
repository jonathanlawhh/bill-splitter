<template>
  <main class="history-page">
    <div class="d-flex flex-column gap-6">

      <!-- Top Bar / Navigation -->
      <div class="d-flex flex-column flex-sm-row justify-between align-center gap-4">
        <div>
          <v-btn class="neo-btn" to="/" id="back-home-btn">
            <v-icon class="mr-2">mdi-arrow-left</v-icon> Back to Splitter
          </v-btn>
        </div>
        <div v-if="historyItems.length > 0">
          <v-btn class="neo-btn pink" @click="showConfirmDeleteAll = true" id="delete-all-btn">
            <v-icon class="mr-2">mdi-delete-sweep</v-icon> Delete All History
          </v-btn>
        </div>
      </div>

      <!-- Confirmation Overlay/Card for Delete All -->
      <div v-if="showConfirmDeleteAll" class="neo-card p-6 bg-white border-pink" id="confirm-delete-all-card">
        <div class="d-flex align-center gap-4 mb-4">
          <v-icon color="#FF007F" size="40">mdi-alert-decagram</v-icon>
          <div>
            <h2 class="text-h5 font-weight-black mb-1">ARE YOU ABSOLUTELY SURE?</h2>
            <p class="text-body-1 font-weight-bold text-dark-gray mb-0">
              This will wipe out all stored receipts in your history. No backups. No returns.
            </p>
          </div>
        </div>
        <div class="d-flex justify-end gap-4">
          <v-btn class="neo-btn navy" @click="showConfirmDeleteAll = false" id="cancel-delete-all-btn">No, Keep
            It</v-btn>
          <v-btn class="neo-btn pink" @click="confirmClearHistory" id="confirm-delete-all-btn">Yes, Delete All</v-btn>
        </div>
      </div>
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="500px">
        <div class="neo-card p-6 bg-white border-pink" id="confirm-delete-single-dialog" style="margin: 0 !important;">
          <div class="d-flex justify-between align-center mb-4">
            <h2 class="text-h5 font-weight-black">Delete Bill?</h2>
          </div>
          <p class="text-body-1 font-weight-bold text-dark-gray mb-6">
            Are you sure you want to delete the bill for <span class="text-navy font-weight-black">{{
              itemToDelete?.merchantName }}</span>?
          </p>
          <div class="d-flex justify-end gap-3">
            <v-btn class="neo-btn navy px-6" @click="showDeleteDialog = false"
              id="cancel-delete-single-btn">Cancel</v-btn>
            <v-btn class="neo-btn pink px-6" @click="confirmDeleteSingle" id="confirm-delete-single-btn">Delete</v-btn>
          </div>
        </div>
      </v-dialog>

      <!-- Empty State -->
      <div v-if="historyItems.length === 0"
        class="neo-card p-12 bg-white text-center d-flex flex-column align-center justify-center gap-6"
        id="empty-state">
        <div>
          <h2 class="text-h4 font-weight-black mb-2">NO HISTORY FOUND</h2>
          <p class="text-h6 font-weight-bold text-dark-gray mb-0">
            You haven't scanned or parsed any receipts yet.
          </p>
        </div>
      </div>

      <!-- History List -->
      <div v-else class="history-list d-flex flex-column gap-4" id="history-list">
        <div v-for="item in historyItems" :key="item.index"
          class="history-item-row neo-card p-6 bg-white d-flex flex-column flex-sm-row justify-between align-start align-sm-center transition-all cursor-pointer gap-4"
          @click="openBill(item.encoded)" :id="'history-item-' + item.index">

          <!-- Left: Receipt Info -->
          <div class="d-flex align-center gap-4 flex-grow-1">
            <div>
              <h2 class="text-h5 font-weight-black mb-1 merchant-title">{{ item.merchantName }}</h2>
              <div class="text-body-2 font-weight-bold text-dark-gray d-flex align-center gap-1">
                <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                <span>{{ item.date }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Total & Delete Actions -->
          <div class="d-flex align-center justify-between justify-sm-end w-100 w-sm-auto gap-6">
            <div class="text-right font-weight-black text-h5 text-navy mr-4">
              {{ formatCurrency(item.total, item.currency) }}
            </div>
            <v-btn class="neo-btn pink delete-single-btn" icon="mdi-delete" @click.stop="deleteItem(item)"
              aria-label="Delete bill" :id="'delete-btn-' + item.index">
            </v-btn>
          </div>

        </div>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { formatCurrency, safeAtob, getBillHistory, deleteBillFromHistory, clearBillHistory } from '~/utils/helpers'

useHead({
  title: 'Bill History | Bill Splitter',
  meta: [
    { name: 'description', content: 'View, reopen, or delete your previous split bills stored in local history.' }
  ]
})

const historyItems = ref([])
const showConfirmDeleteAll = ref(false)
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)

const showNotification = inject('showNotification', () => { })

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
        merchantName: data.merchantName || 'UNKNOWN MERCHANT',
        date: data.date || 'Unknown Date',
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
    showNotification('Bill removed from history.')
  }
  showDeleteDialog.value = false
  itemToDelete.value = null
}

const confirmClearHistory = () => {
  clearBillHistory()
  historyItems.value = []
  showConfirmDeleteAll.value = false
  showNotification('All history deleted successfully.')
}
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.history-item-row:hover {
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0px 0px var(--color-navy) !important;
}

.border-pink {
  border-color: var(--color-pink) !important;
}

.bg-navy-light {
  background-color: var(--color-gray);
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
