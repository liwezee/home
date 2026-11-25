// 防抖：短时间内多次调用，只执行最后一次
let timeout = null;

function debounce(func, wait = 300, immediate = false) {
  // 清除上一次的定时器
  if (timeout !== null) {
    clearTimeout(timeout);
  }
  // 立即执行
  if (immediate) {
    const callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    if (callNow && typeof func === "function") {
      func();
    }
  } else {
    timeout = setTimeout(() => {
      timeout = null;
      if (typeof func === "function") {
        func();
      }
    }, wait);
  }
}

export default debounce;
