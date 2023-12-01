<script setup lang="ts">
import { sayTest } from './features/dev/src/say-test.trpc'
import { sayHello } from './features/landing/src/say-hello.trpc'

const arr1 = ref<string[]>([])
const arr2 = ref<string[]>([])
const test = await sayTest()
async function action() {
    arr1.value.push(await sayTest())
    arr1.value.push(await sayHello('bro'))
    arr2.value.push(await useNuxtApp().$trpc.features.dev.src.sayTest.query())
    arr2.value.push(await useNuxtApp().$trpc.features.landing.src.sayHello.query('sis'))
}
</script>

<template>
    {{ test }}
    <button @click="() => action()">
        Click
    </button>
    <div>
        {{ arr1 }}
    </div>
    <div>
        {{ arr2 }}
    </div>
</template>
