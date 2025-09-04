<template>
  <svg 
    :class="className" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.8-1.3-2.1-1.5-3.5-1.5s-2.7.2-3.5 1.5L2 12.5l1.4 1.4L6 10.4l1.8-.7L9.8 8.9z"/>
    <path d="M10.5 2c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" opacity=".3"/>
  </svg>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: 'w-4 h-4'
  }
})
</script>