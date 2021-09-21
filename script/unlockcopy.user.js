/*
 * @name: 网页复制限制解除
 * @Author: 油猴 Cat73
 * @version: 1.0
 * @description: 通杀大部分网站，可以解除禁止复制、剪切、选择文本的限制。
 * @include: *
 * @createTime: 2019-10-04 01:47:08
 * @updateTime: 2019-10-09 14:10:01
 */
(function () {
  /* 判断是否该执行 */
  const key = encodeURIComponent('Cat73:网页限制解除:执行判断');
  if (window[key]) {
    return;
  };
  window[key] = true;

  /* 开始执行代码 */
  const script = document.createElement('script');
  script.setAttribute('src', 'https://greasyfork.org/scripts/14146-%E7%BD%91%E9%A1%B5%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4/code/%E7%BD%91%E9%A1%B5%E9%99%90%E5%88%B6%E8%A7%A3%E9%99%A4.user.js');
  document.body.append(script);
})();
