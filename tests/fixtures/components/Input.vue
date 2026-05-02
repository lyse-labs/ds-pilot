<script setup lang="ts">
interface InputProps {
  label?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  disabled: false,
  required: false,
});
</script>

<template>
  <div>
    <label v-if="props.label">{{ props.label }}</label>
    <input :type="props.type" :placeholder="props.placeholder" :disabled="props.disabled" :required="props.required" />
  </div>
</template>
