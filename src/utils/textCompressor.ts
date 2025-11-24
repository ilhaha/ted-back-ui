// Base64 解压缩工具函数
import pako from "pako";

export const decompressBase64 = (base64: string): string => {
    try {
        // 1. Base64 解码
        const decodedData = Uint8Array.from(
            atob(base64)
                .split('')
                .map(char => char.charCodeAt(0))
        );

        // 2. 解压缩 GZIP 数据
        const decompressed = pako.ungzip(decodedData, { to: 'string' });

        return decompressed;
    } catch (error) {
        return '内容解析失败'; // 显示友好错误信息
    }
};