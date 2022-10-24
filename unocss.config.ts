import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss';
import transformerDirective from '@unocss/transformer-directives';

export default defineConfig({
  presets: [
    // 使用自带的内部预设  按需引用
    presetUno(),
    presetAttributify(),
    presetIcons()],
  transformers: [
    // UnoCSS transformer for @apply、@screen and theme() directive
    transformerDirective()
  ],
});
