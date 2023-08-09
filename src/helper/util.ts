export const logDebug = (...args: any) => {
  console.debug.apply(console, ["[plugin-git]", ...args]);
};

export const logInfo = (...args: any) => {
  console.info.apply(console, ["[plugin-git]", ...args]);
};

export const logWarn = (...args: any) => {
  console.warn.apply(console, ["[plugin-git]", ...args]);
};

export const debounce = (fn, wait: number = 100, environment?: any) => {
  let timer = null;
  return function (...args) {
    // @ts-ignore
    const context = environment || this;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // @ts-ignore
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, wait);
  };
};
