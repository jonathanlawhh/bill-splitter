<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="550px">
    <div class="neo-card p-6 dialog-container bg-white">
      <!-- Header -->
      <div class="dialog-header d-flex justify-between align-center mb-6">
        <h2 class="text-h5 font-weight-black m-0">{{ $t('splitting.shareDialogTitle') }}</h2>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" aria-label="Close"></v-btn>
      </div>

      <!-- Description -->
      <p class="text-body-1 mb-6 text-dark-gray font-weight-bold">
        {{ $t('splitting.shareDialogDesc') }}
      </p>

      <!-- Selection Cards -->
      <div class="d-flex flex-column gap-6">
        <!-- Option 1: Share with Current Presets -->
        <button class="neo-option-card text-left teal-border mb-6" @click="selectOption(true)">
          <div class="option-header d-flex align-center gap-4 mb-2">
            <v-icon color="#00F5D4" size="36">mdi-playlist-check</v-icon>
            <h3 class="text-h6 font-weight-black m-0">{{ $t('splitting.shareWithPreset') }}</h3>
          </div>
          <p class="text-caption text-dark-gray font-weight-bold m-0 pl-13">
            {{ $t('splitting.shareWithPresetDesc') }}
          </p>
        </button>

        <!-- Option 2: Regular Share (No Presets) -->
        <button class="neo-option-card text-left pink-border mb-6" @click="selectOption(false)">
          <div class="option-header d-flex align-center gap-4 mb-2">
            <v-icon color="#f6339a" size="36">mdi-receipt</v-icon>
            <h3 class="text-h6 font-weight-black m-0">{{ $t('splitting.shareRegular') }}</h3>
          </div>
          <p class="text-caption text-dark-gray font-weight-bold m-0 pl-13">
            {{ $t('splitting.shareRegularDesc') }}
          </p>
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const selectOption = (withPreset) => {
  emit('select', withPreset)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-container {
  border-radius: 24px !important;
}

.neo-option-card {
  background-color: var(--color-white);
  border: var(--border-width) solid var(--color-navy) !important;
  box-shadow: 6px 6px 0px 0px var(--color-navy);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
}

.neo-option-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 10px 10px 0px 0px var(--color-navy);
}

.neo-option-card:active {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0px 0px var(--color-navy);
}

.teal-border:hover {
  border-color: var(--color-navy) !important;
  box-shadow: 10px 10px 0px 0px var(--color-teal) !important;
}

.pink-border:hover {
  border-color: var(--color-navy) !important;
  box-shadow: 10px 10px 0px 0px var(--color-pink) !important;
}

.pl-13 {
  padding-left: 52px;
}
</style>
