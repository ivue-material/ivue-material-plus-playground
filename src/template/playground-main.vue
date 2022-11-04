<template>
    <div class="app">
        <App />
    </div>
</template>

<script setup>
import App from './App.vue';

import { setupIvueMaterialPlus } from './ivue-material-plus.js';
setupIvueMaterialPlus();
</script>

<style>
.app {
    padding: 10px;
}
</style>
