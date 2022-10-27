<template>
    <div class="settings">
        <div class="settings-title">CDN</div>
        <!-- select -->
        <ivue-select v-model="cdn" w-full transfer>
            <ivue-option value="jsdelivr" label="jsDelivr" />
            <ivue-option value="jsdelivr-fastly" label="jsDelivr Fastly" />
            <ivue-option value="unpkg" label="unpkg" />
        </ivue-select>
    </div>
</template>

<script setup lang="ts">
import { cdn } from '@/utils/dependency';
</script>

<style lang="scss" scoped>
.settings {
    display: flex;
    align-items: center;

    &-title{
      margin-right: 10px;
    }
}
</style>
