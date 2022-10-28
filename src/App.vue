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
            @keydown="handleKeydown"
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
import { genCdnLink } from './utils/dependency';

// ts
import type { UserOptions } from '@/composables/store';
import type { SFCOptions } from '@vue/repl';
import type { Fn } from '@vueuse/core';
import type { BuiltInParserName, format } from 'prettier';

import type { default as parserHtml } from 'prettier/parser-html';
import type { default as parserTypescript } from 'prettier/parser-typescript';
import type { default as parserBabel } from 'prettier/parser-babel';
import type { default as parserPostcss } from 'prettier/parser-postcss';

// ref
let loading = ref<boolean>(true);

// 用户选项
const initialUserOptions: UserOptions = {};

// 格式化类型
let prettier:
    | [
          typeof format,
          typeof parserHtml,
          typeof parserTypescript,
          typeof parserBabel,
          typeof parserPostcss
      ]
    | undefined;

// 加载格式化
const loadPrettier = async () => {
    // 加载 prettier
    const load = (path: string) =>
        import(/* @vite-ignore */ genCdnLink('prettier', '2', `/esm/${path}`));

    if (!prettier) {
        prettier = await Promise.all([
            load('standalone.mjs').then((r) => r.default.format),
            load('parser-html.mjs').then((m) => m.default),
            load('parser-typescript.mjs').then((m) => m.default),
            load('parser-babel.mjs').then((m) => m.default),
            load('parser-postcss.mjs').then((m) => m.default),
        ]);
    }

    return prettier;
};

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

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
        event.preventDefault();
        return;
    }

    // 格式化代码
    if (
        (event.altKey || event.ctrlKey) &&
        event.shiftKey &&
        event.code === 'KeyF'
    ) {
        event.preventDefault();
        formatCode();

        return;
    }
};

// 格式化代码
const formatCode = async () => {
    if (!prettier) {
        IvueMessage.info({
            content: 'Loading Prettier...',
            duration: 0,
        });
    }

    const [format, parserHtml, parserTypeScript, parserBabel, parserPostcss] =
        await loadPrettier();

    // 关闭所有提示
    IvueMessage.closeAll?.();

    const file = store.state.activeFile;
    let parser: BuiltInParserName;
    if (file.filename.endsWith('.vue')) {
        parser = 'vue';
    } else if (file.filename.endsWith('.js')) {
        parser = 'babel';
    } else if (file.filename.endsWith('.ts')) {
        parser = 'typescript';
    } else if (file.filename.endsWith('.json')) {
        parser = 'json';
    } else {
        return;
    }

    file.code = format(file.code, {
        parser,
        plugins: [parserHtml, parserTypeScript, parserBabel, parserPostcss],
        semi: false,
        singleQuote: true,
    });
};

// persist state
// 设置history -> 编码的文件URI -> url链接
watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`));
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
