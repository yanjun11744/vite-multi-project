import { readFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// 读取 multiPages.json 文件
const multiPagesPath = path.resolve('scripts', 'multiPages.json');
const distPath = path.resolve('dist'); // 确保这是你的输出目录

try {
    const multiPages = JSON.parse(readFileSync(multiPagesPath, 'utf-8'));

    const clearDist = () => {
        try {
            rmSync(distPath, { recursive: true, force: true });
            console.log('已清理 dist 目录');
        } catch (error) {
            console.error('清理 dist 目录失败:', error.message);
        }
    };

    const buildPages = async () => {
        clearDist(); // 在开始打包前清理 dist 目录
        for (const page of multiPages) {
            const pageName = page.chunk; // 根据实际字段调整
            console.log(`正在打包 ${pageName}...`);

            try {
                execSync(`npm run build --page=${pageName}`, { stdio: 'inherit' });
            } catch (error) {
                console.error(`打包 ${pageName} 失败:`, error.message);
            }
        }
        console.log('所有页面打包完成!');
    };

    buildPages();
} catch (error) {
    console.error('读取 multiPages.json 失败:', error.message);
}