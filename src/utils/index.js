import { message } from 'antd';

const productionHost = 'http://ttttt5.zjjdxr.com/';
export const isDev = process.env.NODE_ENV === 'development';
export const baseUrl = isDev ? 'http://localhost:3001/' : productionHost;
export const scanUrl = isDev ? 'http://localhost:3010/' : 'http://m.zjjdxr.com/'

export const BOOK_SEARCH_HISTORY_KEY = 'book_search_history_key'
export const AUTHOR_SEARCH_HISTORY_KEY = 'author_search_history_key'

// 获取域名，不带 http
export const getHost = (url) => {
  return url.replace(/https?:\/\//, '').replace(/\/.*/, '')
}

export const copyText = (value, isLink) => {
  const input = document.createElement('input');
  input.setAttribute('readonly', 'readonly');
  input.setAttribute('value', value);
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, 9999);
  if (document.execCommand('copy')) {
    document.execCommand('copy');
    message.success(isLink ? '复制链接成功' : '复制成功')
  }
  document.body.removeChild(input);
}

export const onCopyHref = (e) => {
  const href = e.target.getAttribute('data-href')
  copyText(href, true)
}