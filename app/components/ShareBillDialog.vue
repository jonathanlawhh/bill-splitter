<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="550px">
    <div class="neo-card">
      <!-- Header -->
      <div class="d-flex justify-between align-center">
        <h4 class="font-weight-black">{{ $t('splitting.shareDialogTitle') }}</h4>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" aria-label="Close"></v-btn>
      </div>

      <p class="font-weight-bold">
        {{ $t('splitting.shareDialogDesc') }}
      </p>

      <!-- Selection Cards -->
      <div class="d-flex flex-column ga-6">
        <!-- Option 1: Share with Current Presets -->
        <button class="neo-card text-left" @click="selectOption(true)">
          <div class="d-flex align-center ga-4">
            <h3 class="font-weight-black">{{ $t('splitting.shareWithPreset') }}</h3>
          </div>
          <p class="text-body-small text-dark-gray font-weight-bold">
            {{ $t('splitting.shareWithPresetDesc') }}
          </p>
        </button>

        <!-- Option 2: Regular Share (No Presets) -->
        <button class="neo-card text-left" @click="selectOption(false)">
          <div class="d-flex align-center ga-4">
            <h3 class="font-weight-black">{{ $t('splitting.shareRegular') }}</h3>
          </div>
          <p class="text-body-small text-dark-gray font-weight-bold">
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
