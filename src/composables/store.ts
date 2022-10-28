
// is dev
import { IS_DEV } from '@/constants';
import { atou, utoa } from '@/utils/encode';
import { File } from '@vue/repl';
import { genCdnLink, genImportMap, genVueLink } from '@/utils/dependency';
import { mergeImportMap } from '@/utils/import-map';
import { compileFile } from '@vue/repl';

// ts
import type { StoreState, Store } from '@vue/repl';
import type { ImportMap } from '@/utils/import-map';

// template
import welcomeCode from '../template/welcome.vue?raw';
import playgroundMainCode from '../template/playground-main.vue?raw';
import ivueMaterialPlusCode from '../template/ivue-material-plus.js?raw';

// 版本号
export type VersionKey = 'vue' | 'ivueMaterialPlus'

// 版本
export type Versions = Record<VersionKey, string>

// 安装的参数
export interface Initial {
  // 加密的字符串
  serializedState?: string
  // 版本号
  versions?: Versions
  // 用户选项
  userOptions?: UserOptions
}

export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}

export type SerializeState = Record<string, string> & {
  _o?: UserOptions
}

// 文件名称
const APP_FILE = 'App.vue';
const PLAYGROUND_MAIN_FILE = 'PlaygroundMain.vue';
const IVUE_MATERIAL_PLUS_FILE = 'ivue-material-plus.js';
const IMPORT_MAP = 'import-map.json';

export const USER_IMPORT_MAP = 'import_map.json';

export const useStore = (initial: Initial) => {

  // 当前安装ui库版本
  const versions = reactive(
    initial.versions || { vue: 'latest', ivueMaterialPlus: 'latest' }
  );

  // 编译器
  let compiler = $(shallowRef<typeof import('vue/compiler-sfc')>());

  // A boolean switcher with utility functions
  const [nightly, toggleNightly] = $(useToggle(false));

  // 用户选项
  let userOptions = $ref<UserOptions>(initial.userOptions || {});

  // 隐藏文件
  const hideFile = $computed(() => !IS_DEV && !userOptions.showHidden);

  // 所有需要显示的文件
  const files = initFiles(initial.serializedState || '');

  // state
  const state = reactive<StoreState>({
    mainFile: PLAYGROUND_MAIN_FILE,
    files,
    activeFile: files[APP_FILE],
    errors: [],
    vueRuntimeURL: '',
    vueServerRendererURL: '',
    // used to force reset the sandbox
    resetFlip: false
  });


  // computed

  // 插入软件包
  const bultinImportMap = $computed<ImportMap>(() =>
    genImportMap(versions)
  );

  // 用户自定义软件包
  const userImportMap = $computed<ImportMap>(() => {
    const code = state.files[USER_IMPORT_MAP]?.code.trim();

    if (!code) {
      return {};
    }
    let map: ImportMap = {};

    try {
      map = JSON.parse(code);
    } catch (err) {
      console.error(err);
    }

    return map;
  });

  // 合并软件包
  const importMap = $computed<ImportMap>(() =>
    mergeImportMap(bultinImportMap, userImportMap)
  );

  const store: Store = reactive({
    init,
    state,
    compiler: $$(compiler!),
    setActive,
    addFile,
    deleteFile,
    getImportMap,
    initialShowOutput: false,
    initialOutputMode: 'preview',
  });

  // methods

  // 获取初始配置文件
  function initFiles(serializedState: string) {
    const files: StoreState['files'] = {};

    if (serializedState) {
      // 解码base64
      const saved = deserialize(serializedState);

      for (const [filename, file] of Object.entries(saved)) {
        if (filename === '_o') {
          continue;
        }

        // 配置渲染文件
        files[filename] = new File(filename, file as string);
      }


      userOptions = saved._o || {};
    }
    else {
      // 设置App.vue文件
      files[APP_FILE] = new File(APP_FILE, welcomeCode);
    }

    // 渲染代码的文件
    files[PLAYGROUND_MAIN_FILE] = new File(PLAYGROUND_MAIN_FILE, playgroundMainCode, hideFile);

    // 用户自定义导入
    if (!files[USER_IMPORT_MAP]) {
      files[USER_IMPORT_MAP] = new File(
        USER_IMPORT_MAP,
        JSON.stringify({ imports: {} }, undefined, 2)
      );
    }

    return files;
  }

  // 获取文件
  function getFiles() {
    const exported: Record<string, string> = {};

    for (const file of Object.values(state.files)) {
      // 是否隐藏文件
      if (file.hidden) {
        continue;
      }

      exported[file.filename] = file.code;
    }

    return exported;
  }

  // 编码为新字符串
  function serialize() {
    const state: SerializeState = { ...getFiles() };
    state._o = userOptions;

    return utoa(JSON.stringify(state));
  }


  // 解码base64
  function deserialize(text: string): SerializeState {
    const state = JSON.parse(atou(text));

    return state;
  }

  // 安装
  async function init() {
    await setVueVersion(versions.vue);

    for (const file of Object.values(state.files)) {
      // 编译文件
      compileFile(store, file);
    }

    // watchEffect activeFile 可以编辑的文件
    watchEffect(() => compileFile(store, state.activeFile));
  }

  // 设置vue版本
  async function setVueVersion(version: string) {
    // 获取vue包
    const { compilerSfc, runtimeDom } = genVueLink(version);

    // 编译器
    compiler = await import(/* @vite-ignore */ compilerSfc);
    // @vue/runtime-dom
    state.vueRuntimeURL = runtimeDom;
    // vue版本
    versions.vue = version;

    console.info(`[@vue/repl] Now using Vue version: ${version}`);
  }

  // 设置可以编辑的文件
  function setActive(filename: string) {
    const file = state.files[filename];

    // 是否隐藏文件
    if (file.hidden) {
      return;
    }

    // 可以编辑的文件
    state.activeFile = state.files[filename];
  }

  // 添加文件
  function addFile(fileOrFilename: string | File) {
    const file =
      typeof fileOrFilename === 'string'
        ? new File(fileOrFilename)
        : fileOrFilename;
    state.files[file.filename] = file;

    setActive(file.filename);
  }

  // 删除文件
  async function deleteFile(filename: string) {
    // 是否是可以删除的文件
    if (
      [
        IVUE_MATERIAL_PLUS_FILE,
        PLAYGROUND_MAIN_FILE,
        APP_FILE,
        IVUE_MATERIAL_PLUS_FILE,
        IMPORT_MAP,
        USER_IMPORT_MAP,
      ].includes(filename)
    ) {
      IvueMessage.warning({
        content: 'You cannot remove it, because Element Plus requires it.'
      });

      return;
    }

    if (
      await IvueModal.confirm(
        `Are you sure you want to delete ${filename}?`,
        {
          title: 'Delete File',
          type: 'warning',
          center: true,
        }
      )
    ) {

      if (state.activeFile.filename === filename) {
        setActive(APP_FILE);
      }

      delete state.files[filename];
    }
  }

  // 获取合并软件包
  function getImportMap() {
    return importMap;
  }

  // 设置版本号
  async function setVersion(key: VersionKey, version: string) {
    switch (key) {
      // 设置ui库版本号
      case 'ivueMaterialPlus':
        setIvueMaterialPlusVersion(version);
        break;
      // 设置vue版本
      case 'vue':
        await setVueVersion(version);
        break;
    }
  }

  // 设置ui库版本号
  function setIvueMaterialPlusVersion(version: string) {
    versions.ivueMaterialPlus = version;
  }

  // 获取 ivue-material-plus.js code
  function generateIvueMaterialPlusCode(version: string, styleSource?: string) {
    const style = styleSource
      ? styleSource.replace('#VERSION#', version)
      : genCdnLink(
        'ivue-material-plus',
        version,
        '/dist/styles/index.css'
      );

    // 替换链接地址
    return ivueMaterialPlusCode.replace('#STYLE#', style);
  }


  // watch

  // 监听合并软件包
  watch(
    $$(importMap),
    (content) => {
      // 添加文件
      state.files[IMPORT_MAP] = new File(
        IMPORT_MAP,
        JSON.stringify(content, undefined, 2),
        hideFile
      );
    },
    { immediate: true, deep: true }
  );

  watch(
    () => versions.ivueMaterialPlus,
    (version) => {

      // 设置ui库文件地址
      const file = new File(
        IVUE_MATERIAL_PLUS_FILE,
        generateIvueMaterialPlusCode(version, userOptions.styleSource).trim(),
        hideFile
      );

      // ui库文件
      state.files[IVUE_MATERIAL_PLUS_FILE] = file;

      // 编译文件
      compileFile(store, file);
    },
    {
      // 立即响应
      immediate: true
    }
  );


  return {
    ...store,

    // versions
    versions,
    // useToggle
    nightly: $$(nightly),
    // 用户选项
    userOptions: $$(userOptions),

    // 安装
    init,
    // 编码为新字符串
    serialize,
    // 设置版本号
    setVersion,
    // useToggle
    toggleNightly,
  };
};

export type ReplStore = ReturnType<typeof useStore>
