
// ts
import type { Versions } from '@/composables/store';
import type { ImportMap } from '@/utils/import-map';


export type Cdn = 'unpkg' | 'jsdelivr' | 'jsdelivr-fastly'
export const cdn = useLocalStorage<Cdn>('setting-cdn', 'jsdelivr-fastly');

// 依赖
export interface Dependency {
  pkg?: string
  version?: string
  path: string
}

// 导入软件包
export const genImportMap = (
  { vue, ivueMaterialPlus }: Partial<Versions> = {}
): ImportMap => {
  const deps: Record<string, Dependency> = {
    vue: {
      pkg: '@vue/runtime-dom',
      version: vue,
      path: '/dist/runtime-dom.esm-browser.js',
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js',
    },
    'ivue-material-plus': {
      pkg: 'ivue-material-plus',
      version: ivueMaterialPlus,
      path: '/dist/ivue-material-plus.min.js',
    },
    'ivue-material-plus/': {
      pkg: 'ivue-material-plus',
      version: ivueMaterialPlus,
      path: '/',
    },
  };

  return {
    imports: Object.fromEntries(
      Object.entries(deps).map(([key, dep]) => [
        key,
        genCdnLink(dep.pkg ?? key, dep.version, dep.path),
      ])
    ),
  };
};


// 获取cdn链接
export const genCdnLink = (
  pkg: string,
  version: string | undefined,
  path: string
) => {
  version = version ? `@${version}` : '';
  switch (cdn.value) {
    case 'jsdelivr':
      return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`;
    case 'jsdelivr-fastly':
      return `https://fastly.jsdelivr.net/npm/${pkg}${version}${path}`;
    case 'unpkg':
      return `https://unpkg.com/${pkg}${version}${path}`;
  }
};

// 获取vue包
export const genVueLink = (version: string) => {
  const compilerSfc = genCdnLink(
    '@vue/compiler-sfc',
    version,
    '/dist/compiler-sfc.esm-browser.js'
  );
  const runtimeDom = genCdnLink(
    '@vue/runtime-dom',
    version,
    '/dist/runtime-dom.esm-browser.js'
  );
  return {
    compilerSfc,
    runtimeDom,
  };
};
