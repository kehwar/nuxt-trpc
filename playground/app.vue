<!-- eslint-disable antfu/top-level-function -->
<script setup lang="ts">
import _ from 'lodash'
import { sayTest } from './features/dev/src/say-test.trpc'
import { sayHello } from './features/landing/src/say-hello.trpc'
import { sayGoodbye } from './features/landing/src/say-goodbye.trpc'

onMounted(() => {

})

const arr1 = ref<string[]>([])
async function action() {
    arr1.value.push(await sayTest())
    arr1.value.push(await sayHello())
    arr1.value.push(await sayGoodbye())
}
</script>

<template>
    <button @click="() => action()">
        Click
    </button>
    <div v-for="message of arr1">
        {{ message }}
    </div>
</template>
