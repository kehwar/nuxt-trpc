<script setup lang="ts">
import { sayTest } from './features/dev/src/test.trpc'
import { sayGoodbye } from './features/landing/src/say-goodbye.trpc'

const hello = await useNuxtApp().$trpc.features.landing.src.sayHello.query()
const goodBye = await sayGoodbye()
const testClient = await sayTest()
const testServer = await useNuxtApp().$trpc.features.dev.src.test.query()
</script>

<template>
    <div>
        {{ hello }}
    </div>
    <div>
        {{ goodBye }}
    </div>
    <div>
        {{ testClient }}
    </div>
    <div>
        {{ testServer }}
    </div>
</template>
