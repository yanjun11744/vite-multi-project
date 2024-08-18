// vite-plugin-thymeleaf.js
export default function thymeleafPlugin() {
    return {
        name: 'vite-plugin-thymeleaf',
        transform(code, id) {
            if (id.endsWith('.html')) {
                const updatedCode = code
                    .replace(/src="([^"]+)"/g, 'th:src="@{$1}"')
                    .replace(/href="([^"]+)"/g, 'th:href="@{$1}"');
                return {
                    code: updatedCode,
                    map: null,
                };
            }
            return null;
        },
    };
}