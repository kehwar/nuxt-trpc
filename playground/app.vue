<script setup lang="ts">
import { sayGoodbye } from './features/landing/src/say-goodbye.trpc'

const goodBye = await sayGoodbye()
</script>

<template>
  <div>
    {{ goodBye }}
  </div>
</template>
