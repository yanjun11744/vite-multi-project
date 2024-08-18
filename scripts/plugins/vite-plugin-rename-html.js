// scripts/plugins/vite-plugin-rename-html.js

const renameHtmlPlugin = (npmConfigPage) => {
    return {
        name: 'rename-html',
        generateBundle(options, bundle) {
            const oldFileName = 'index.html';
            const newFileName = `${npmConfigPage}.html`;

            // 检查是否存在 index.html 并且模块名不是 index
            if (bundle[oldFileName] && npmConfigPage !== 'index') {
                bundle[newFileName] = {
                    ...bundle[oldFileName],
                    fileName: newFileName,
                };
                // 删除旧的 index.html
                delete bundle[oldFileName];
            }
        },
    };
};

export default renameHtmlPlugin;