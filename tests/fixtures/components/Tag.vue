<script setup lang="ts">
interface TagProps {
  label: string;
  color?: "blue" | "green" | "red" | "gray";
  removable?: boolean;
}

const props = defineProps<TagProps>();

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <span>
    {{ props.label }}
    <button v-if="props.removable" @click="emit('remove')">x</button>
  </span>
</template>
