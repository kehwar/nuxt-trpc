<script setup lang="ts">
const hello = await useNuxtApp().$trpc.features.landing.src.sayHello.query()
// const goodBye = await sayGoodbye()
// const testClient = await sayTest()
const testServer = await useNuxtApp().$trpc.features.dev.src.test.query()
</script>

<template>
    <div>
        {{ hello }}
    </div>
    <!-- <div>
        {{ goodBye }}
    </div>
    <div>
        {{ testClient }}
    </div> -->
    <div>
        {{ testServer }}
    </div>
</template>
