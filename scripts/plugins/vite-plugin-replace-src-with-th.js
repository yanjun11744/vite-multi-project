// vite-plugin-replace-src-with-th.js
export function replaceSrcWithTh() {
    return {
        name: 'replace-src-with-th',
        enforce: 'post',
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                if (fileName.endsWith('.html')) {
                    const html = bundle[fileName].source;
                    // 替换所有 src 和 href 属性
                    const newHtml = html
                        .replace(/src="([^"]+)"/g, `th:src="@{$1}"`)
                        .replace(/href="([^"]+)"/g, `th:href="@{$1}"`);
                    // 更新文件内容
                    bundle[fileName].source = newHtml;
                }
            }
        }
    }
}