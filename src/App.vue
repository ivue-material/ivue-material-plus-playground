<template>
    <!-- 内容 -->
    <div v-if="!loading" antialiased>{{loading}}</div>
    <!-- 加载中 -->
    <template v-else>
        <div v-loading="{ text: 'Loading...' }" h-100vh />
    </template>
</template>

<script lang="ts">
import { ref } from 'vue';
import type { UserOptions } from '@/composables/store';

export default {
    setup() {
        // ref
        let loading = ref(true);

        // 用户选项
        const initialUserOptions: UserOptions = {};

        const store = useStore({
            serializedState: location.hash.slice(1),
            userOptions: initialUserOptions,
        });

// store.init().then(() => (loading = false));


        console.log('store', store);
        return {
            loading,
        };
    },
};
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
