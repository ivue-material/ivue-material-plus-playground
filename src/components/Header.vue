<template>
    <nav class="header">
        <!-- 标题 -->
        <h1 class="header-title" leading="[var(--nav-height)]" m-0 inline-block font-medium>
            <!-- img -->
            <img h-24px relative mr-2 v="mid" top="-2px" alt="logo" src="../assets/logo.png" />
            <div class="header-content" lt-sm-hidden flex="inline row gap-1" items-center>
                <span class="header-name">Ivue Material Plus Playground</span>
                <ivue-chip
                    class="chip-small"
                    color="#5B8EFF"
                    text-color="#ffffff"
                    depressed
                >{{ appVersion }}</ivue-chip>
                <ivue-chip
                    class="chip-small"
                    color="#5B8EFF"
                    text-color="#ffffff"
                    depressed
                >repl v{{ replVersion }}</ivue-chip>
            </div>
        </h1>
        <!-- 右边按钮 -->
        <div flex="~ gap-2" items-center>
            <!-- versions -->
            <div
                v-for="(item, key) of versions"
                :key="key"
                flex="~ gap-2"
                items-center
                lt-lg-hidden
            >
                <p class="text">{{ item.text }} Version:</p>
                <ivue-select
                    class="select"
                    v-model="item.active"
                    w-36
                    @on-change="(value) => setVersion(key, value)"
                >
                    <ivue-option value="latest">latest</ivue-option>
                    <ivue-option v-for="ver of item.published" :key="ver" :value="ver">{{ ver }}</ivue-option>
                </ivue-select>
            </div>
            <!-- 按钮 -->
            <div flex="~ gap-4">
                <!-- 复制 -->
                <ivue-icon class="icon" @click="handleCopyLink">share</ivue-icon>
                <!-- github -->
                <a
                    href="https://github.com/qq282126990/ivue-ui-plus-playground"
                    target="_blank"
                    class="github"
                ></a>
                <!-- 配置 -->
                <ivue-popover width="300px" placement="bottom-end">
                    <ivue-icon class="icon">settings</ivue-icon>
                    <template #content>
                        <Settings></Settings>
                    </template>
                </ivue-popover>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import {
    getSupportedIvueVersions,
    getSupportedVueVersions,
} from '../utils/dependency';

// ts
import type { ReplStore, VersionKey } from '@/composables/store';
import type { ComputedRef } from 'vue';

interface Version {
    text: string;
    published: ComputedRef<string[]>;
    active: string;
}

//
const appVersion = import.meta.env.APP_VERSION;
const replVersion = import.meta.env.REPL_VERSION;

// props
const props = defineProps<{
    store: ReplStore;
}>();

// 版本号
const versions = reactive<Record<VersionKey, Version>>({
    ivueMaterialPlus: {
        text: 'Ivue Material Plus',
        published: getSupportedIvueVersions(),
        active: props.store.versions.ivueMaterialPlus,
    },
    vue: {
        text: 'Vue',
        published: getSupportedVueVersions(),
        active: props.store.versions.vue,
    },
});

// 设置版本号
async function setVersion(key: VersionKey, v: string) {
    versions[key].active = 'loading...';

   await props.store.setVersion(key, v);

    versions[key].active = v;
}

// 复制链接
async function handleCopyLink() {
    await navigator.clipboard.writeText(location.href);

    IvueMessage.success({
        content: 'Sharable URL has been copied to clipboard.',
    });
}
</script>

<style lang="scss">
nav {
    --bg: #fff;
    --bg-light: #fff;
    --border: #ddd;

    --at-apply: 'box-border flex justify-between px-4 z-999 relative';

    height: var(--nav-height);
    background-color: var(--bg);
    box-shadow: 0 0 6px var(--ivue-color-primary);
}

.header {
    font-size: 14px;

    &-title {
        overflow: hidden;
        display: flex;
        align-items: center;
    }

    &-name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    &-content{
        overflow: hidden;
    }

    .text {
        white-space: nowrap;
    }

    .select {
        width: 150px;
    }

    .icon {
        cursor: pointer;
        color: #000;
    }

    .github {
        background: url('../assets/github.svg') no-repeat;
        width: 24px;
        height: 24px;
        background-size: cover;
    }
}

.chip-small {
    font-size: 12px;

    .ivue-chip-content {
        height: 20px;
        padding: 0 7px;
    }
}
</style>
