import {
  getCurrentInstance
} from 'vue';
import IvueMaterialPlus from 'ivue-material-plus';

let installed = false;

await loadStyle();

export function setupIvueMaterialPlus() {
  if (installed) {
    return;
  }
  // 注册组件
  const instance = getCurrentInstance();
  instance.appContext.app.use(IvueMaterialPlus);
  installed = true;
}

// 加载样式
export function loadStyle() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '#STYLE#';
    link.addEventListener('load', resolve);
    link.addEventListener('error', reject);
    document.body.append(link);
  });
}
