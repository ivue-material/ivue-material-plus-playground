<template>
    <!-- 内容 -->
    <div v-if="!loading" antialiased>
        <!-- 头部 -->
        <Header :store="store"></Header>
        <!-- 内容 -->
        <Repl
            :store="store"
            show-compile-output
            auto-resize
            :sfc-options="sfcOptions"
            :clear-console="false"
            :show-import-map="store.userOptions.value.showHidden || IS_DEV"
            ref="repl"
        ></Repl>
    </div>
    <!-- 加载中 -->
    <template v-else>
        <div v-loading="{ text: 'Loading...' }" h-100vh />
    </template>
</template>

<script setup lang="ts">
import { Repl } from '@vue/repl';
import { IS_DEV } from './constants';

// ts
import type { UserOptions } from '@/composables/store';
import type { SFCOptions } from '@vue/repl';

// ref
let loading = ref<boolean>(true);

// 用户选项
const initialUserOptions: UserOptions = {};

// 注册配置文件
const store = useStore({
    serializedState: location.hash.slice(1),
    userOptions: initialUserOptions,
});

// 安装完成
store.init().then(() => {
    loading.value = false;
});

// enable experimental features
const sfcOptions: SFCOptions = {
    script: {
        reactivityTransform: true,
    },
};

// persist state
// 设置history -> 编码的文件URI -> url链接
// watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`));
</script>

<style lang="scss">
body {
    --at-apply: m-none text-13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --base: #444;
    --nav-height: 50px;
}

.vue-repl {
    height: calc(100vh - var(--nav-height));
}

.dark .vue-repl,
.vue-repl {
    --color-branding: var(--ivue-color-primary) !important;
}
</style>
