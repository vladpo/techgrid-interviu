<script setup lang="ts" generic="T extends GenericObject">
import type { FormContainerProps } from '.'
import { type GenericObject, useForm } from 'vee-validate'
import { computed, nextTick, ref } from 'vue'
import { Maybe } from 'purify-ts/Maybe'

const props = withDefaults(defineProps<FormContainerProps<T>>(), { direction: 'col' })
const { defineField, handleSubmit } = useForm<T>()
const inputs = props.formInputs.map((formInput) => {
  const [field, attributes] = defineField(formInput.field)
  return {
    field,
    attributes,
    type: formInput.type,
    placeholder: formInput.field.charAt(0).toUpperCase() + formInput.field.slice(1),
    id: formInput.field
  }
})
const errors = ref<string | undefined>()
const onSubmit = handleSubmit((t: T) => props.onSubmit(t, (errMsg) => (errors.value = errMsg)))
nextTick(() =>
  Maybe.fromNullable(document.getElementById(props.formInputs[0].field)).ifJust((e) => e.focus())
)
const minH = computed(() => {
  return props.direction === 'col' ? 'min-h-[75vh]' : 'min-h-[25vh]'
})
const flexDirection = computed(() => {
  return props.direction === 'col' ? 'flex-col' : 'flex-row'
})
</script>

<template>
  <div class="p-8 flex items-center justify-center transition-all duration-200" :class="minH">
    <form @submit="onSubmit">
      <div
        :class="['bg-white/10 p-9 rounded-xl backdrop-blur-xl flex gap-6 shadow-xl', flexDirection]"
      >
        <pre v-if="errors">{{ errors }}</pre>
        <input
          class="font-sans px-5 py-2 font-medium bg-white/10 text-white border border-transparent placeholder:text-white/60 hover:border-white/40 focus:outline-none focus:bg-white/20 rounded-full transition-colors duration-300"
          v-for="input in inputs"
          :key="input.id"
          v-model="input.field.value"
          :type="input.type"
          v-bind="input.attributes.value"
          :placeholder="input.placeholder"
          :id="input.id"
        />
        <button
          class="bg-black/20 hover:bg-black/30 border-1 px-3 py-2 text-white transition-colors duration-300 shadow-2 rounded-full focus:outline-0 focus:bg-black/30"
          type="submit"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
