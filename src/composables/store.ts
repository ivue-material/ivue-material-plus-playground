
// is dev
import { IS_DEV } from '@/constants';

export type VersionKey = 'vue' | 'ivue-material-plus'

export type Versions = Record<VersionKey, string>

export interface Initial {
  serializedState?: string
  versions?: Versions
  userOptions?: UserOptions
}

export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}

export const useStore = (initial: Initial) => {

  const versions = reactive(
    initial.versions || { vue: 'latest', ivueMaterialPlus: 'latest' }
  );

  const compiler = $(shallowRef<typeof import('vue/compiler-sfc')>());

  // A boolean switcher with utility functions
  const [nightly, toggleNightly] = $(useToggle(false));

  // 用户选项
  const userOptions = $ref<UserOptions>(initial.userOptions || {});

  // 隐藏文件
  const hideFile = $computed(() => !IS_DEV && !userOptions.showHidden);

  const files = initFiles(initial.serializedState || '');

  console.log('files', files);

  // methods
  function initFiles(serializedState: string) {
    const files: StoreState['files'] = {};
    // if (serializedState) {
    //   const saved = deserialize(serializedState)
    //   for (const [filename, file] of Object.entries(saved)) {
    //     if (filename === '_o') continue
    //     files[filename] = new File(filename, file as string)
    //   }
    //   userOptions = saved._o || {}
    // } else {
    //   files[APP_FILE] = new File(APP_FILE, welcomeCode)
    // }
    // files[MAIN_FILE] = new File(MAIN_FILE, mainCode, hideFile)
    // if (!files[USER_IMPORT_MAP]) {
    //   files[USER_IMPORT_MAP] = new File(
    //     USER_IMPORT_MAP,
    //     JSON.stringify({ imports: {} }, undefined, 2)
    //   )
    // }
    // return files
  }

  return {

  };
};

export type ReplStore = ReturnType<typeof useStore>
