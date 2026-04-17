// @name 瓜子APP
// @author 
// @description 刮削：支持，弹幕：支持，嗅探：支持
// @version 1.0.5
// @dependencies: axios, crypto
// @downloadURL https://github.com/lyl9845/yzdlyl/blob/main/yuan/gz5.js

/**
 * ============================================================================
 * 瓜子APP - OmniBox 爬虫脚本
 * ============================================================================
 * 
 * 功能说明:
 * - 提供瓜子视频APP源的 OmniBox 格式接口
 * - 支持分类浏览、搜索、详情、播放等功能
 * - 集成 RSA/AES 加密通信
 * - 搜索过滤功能，精准匹配搜索结果
 * 
 * 主要特性:
 * 1. 分类支持：电影、电视剧、动漫、综艺、短剧
 * 2. 筛选功能：支持年份、地区、排序等筛选条件
 * 3. 加密通信：RSA解密 + AES加解密 + MD5签名
 * 4. 缓存机制：提升请求性能
 * 5. 搜索过滤：精准匹配结果
 * 
 * 日期: 2025.02.27
 * ============================================================================
 */

// 简化版OmniBox模拟对象，用于在普通环境中运行
const OmniBox = {
    log: (level, message) => {
        console.log(`[${level}] ${message}`);
    },
    request: async (url, options) => {
        // 简化版请求函数，实际使用中需要根据环境调整
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, options);
        return {
            statusCode: response.status,
            body: await response.text()
        };
    }
};

// 模拟crypto库功能
const crypto = require('crypto');

// 模拟axios库功能
const axios = require('axios');

// 模拟https库功能
const https = require('https');

/**
 * 配置信息
 */
const config = {
    host: 'https://api.w32z7vtd.com',
    headers: {
        'Cache-Control': 'no-cache',
        'Version': '2406025',
        'PackageName': 'com.uf076bf0c246.qe439f0d5e.m8aaf56b725a.ifeb647346f',
        'Ver': '1.9.2',
        'Referer': 'https://api.w32z7vtd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/3.12.0'
    },
    timeout: 15000 // 延长超时时间
};
const DANMU_API = process.env.DANMU_API || "";

/**
 * 创建 HTTPS Agent (忽略 SSL 证书验证)
 */
const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 50,
    maxFreeSockets: 10,
    scheduling: 'lifo',
    rejectUnauthorized: false  // 忽略 SSL 证书验证
});

/**
 * 创建 Axios 实例
 */
const axiosInstance = axios.create({
    httpsAgent,
    timeout: config.timeout,
    headers: config.headers,
    validateStatus: (status) => {
        // 放宽状态码验证，兼容非200但正常返回的情况
        return status >= 200 && status < 500;
    }
});

/**
 * RSA 私钥
 */
const privateKey = `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1
ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU
1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcK
ZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7
HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcW
V9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdI
DblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34
saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVM
iMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUM
WBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8
jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZ
K7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1b
L3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oa
t5lYKfpe8k83ZA==
-----END PRIVATE KEY-----`;

const staticKeys = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=";
const token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';

/**
 * 分类配置
 */
const CLASSES = [
    { type_id: "1", type_name: "电影" },
    { type_id: "2", type_name: "电视剧" },
    { type_id: "4", type_name: "动漫" },
    { type_id: "3", type_name: "综艺" },
    { type_id: "64", type_name: "短剧" }
];

/**
 * 筛选配置
 */
const FILTERS = {
    '1': [
        {
            key: 'year',
            name: '年份',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '2026', value: '2026' },
                { name: '2025', value: '2025' },
                { name: '2024', value: '2024' },
                { name: '2023', value: '2023' },
                { name: '2022', value: '2022' },
                { name: '2021', value: '2021' },
                { name: '2020', value: '2020' },
                { name: '2019', value: '2019' },
                { name: '2018', value: '2018' },
                { name: '2017', value: '2017' },
                { name: '2016', value: '2016' },
                { name: '2015', value: '2015' },
                { name: '2014', value: '2014' },
                { name: '2013', value: '2013' },
                { name: '2012', value: '2012' },
                { name: '2011', value: '2011' },
                { name: '2010', value: '2010' },
                { name: '2009', value: '2009' },
                { name: '2008', value: '2008' },
                { name: '2007', value: '2007' },
                { name: '2006', value: '2006' },
                { name: '2005', value: '2005' },
                { name: '更早', value: '2004' }
            ]
        },
        {
            key: 'area',
            name: '地区',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '大陆', value: '大陆' },
                { name: '香港', value: '香港' },
                { name: '台湾', value: '台湾' },
                { name: '美国', value: '美国' },
                { name: '韩国', value: '韩国' },
                { name: '日本', value: '日本' },
                { name: '英国', value: '英国' },
                { name: '法国', value: '法国' },
                { name: '泰国', value: '泰国' },
                { name: '印度', value: '印度' },
                { name: '其他', value: '其他' }
            ]
        },
        {
            key: 'sort',
            name: '排序',
            init: 'd_id',
            value: [
                { name: '最新', value: 'd_id' },
                { name: '最热', value: 'd_hits' },
                { name: '推荐', value: 'd_score' }
            ]
        }
    ],
    '2': [
        {
            key: 'year',
            name: '年份',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '2026', value: '2026' },
                { name: '2025', value: '2025' },
                { name: '2024', value: '2024' },
                { name: '2023', value: '2023' },
                { name: '2022', value: '2022' },
                { name: '2021', value: '2021' },
                { name: '2020', value: '2020' },
                { name: '2019', value: '2019' },
                { name: '2018', value: '2018' },
                { name: '2017', value: '2017' },
                { name: '2016', value: '2016' },
                { name: '2015', value: '2015' },
                { name: '2014', value: '2014' },
                { name: '2013', value: '2013' },
                { name: '2012', value: '2012' },
                { name: '2011', value: '2011' },
                { name: '2010', value: '2010' },
                { name: '2009', value: '2009' },
                { name: '2008', value: '2008' },
                { name: '2007', value: '2007' },
                { name: '2006', value: '2006' },
                { name: '2005', value: '2005' },
                { name: '更早', value: '2004' }
            ]
        },
        {
            key: 'area',
            name: '地区',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '大陆', value: '大陆' },
                { name: '香港', value: '香港' },
                { name: '台湾', value: '台湾' },
                { name: '美国', value: '美国' },
                { name: '韩国', value: '韩国' },
                { name: '日本', value: '日本' },
                { name: '英国', value: '英国' },
                { name: '法国', value: '法国' },
                { name: '泰国', value: '泰国' },
                { name: '印度', value: '印度' },
                { name: '其他', value: '其他' }
            ]
        },
        {
            key: 'sort',
            name: '排序',
            init: 'd_id',
            value: [
                { name: '最新', value: 'd_id' },
                { name: '最热', value: 'd_hits' },
                { name: '推荐', value: 'd_score' }
            ]
        }
    ],
    '4': [
        {
            key: 'year',
            name: '年份',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '2026', value: '2026' },
                { name: '2025', value: '2025' },
                { name: '2024', value: '2024' },
                { name: '2023', value: '2023' },
                { name: '2022', value: '2022' },
                { name: '2021', value: '2021' },
                { name: '2020', value: '2020' },
                { name: '2019', value: '2019' },
                { name: '2018', value: '2018' },
                { name: '2017', value: '2017' },
                { name: '2016', value: '2016' },
                { name: '2015', value: '2015' }
            ]
        },
        {
            key: 'area',
            name: '地区',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '大陆', value: '大陆' },
                { name: '日本', value: '日本' },
                { name: '美国', value: '美国' },
                { name: '其他', value: '其他' }
            ]
        },
        {
            key: 'sort',
            name: '排序',
            init: 'd_id',
            value: [
                { name: '最新', value: 'd_id' },
                { name: '最热', value: 'd_hits' },
                { name: '推荐', value: 'd_score' }
            ]
        }
    ],
    '3': [
        {
            key: 'year',
            name: '年份',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '2026', value: '2026' },
                { name: '2025', value: '2025' },
                { name: '2024', value: '2024' },
                { name: '2023', value: '2023' },
                { name: '2022', value: '2022' }
            ]
        },
        {
            key: 'area',
            name: '地区',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '大陆', value: '大陆' },
                { name: '台湾', value: '台湾' },
                { name: '韩国', value: '韩国' }
            ]
        },
        {
            key: 'sort',
            name: '排序',
            init: 'd_id',
            value: [
                { name: '最新', value: 'd_id' },
                { name: '最热', value: 'd_hits' },
                { name: '推荐', value: 'd_score' }
            ]
        }
    ],
    '64': [
        {
            key: 'year',
            name: '年份',
            init: '0',
            value: [
                { name: '全部', value: '0' },
                { name: '2026', value: '2026' },
                { name: '2025', value: '2025' },
                { name: '2024', value: '2024' },
                { name: '2023', value: '2023' }
            ]
        },
        {
            key: 'sort',
            name: '排序',
            init: 'd_id',
            value: [
                { name: '最新', value: 'd_id' },
                { name: '最热', value: 'd_hits' },
                { name: '推荐', value: 'd_score' }
            ]
        }
    ]
};

/**
 * API 路径
 */
const API_PATHS = {
    INDEX_LIST: '/App/IndexList/indexList',
    PLAY_INFO: '/App/IndexPlay/playInfo',
    VURL_SHOW: '/App/Resource/Vurl/show',
    VURL_DETAIL: '/App/Resource/VurlDetail/showOne',
    FIND_MORE: '/App/Index/findMoreVod'
};

/**
 * 缓存管理
 */
const cache = {
    data: new Map(),
    ttl: {
        category: 300000,
        detail: 600000,
        play: 300000,
        search: 60000
    },
    get: (key) => {
        const item = cache.data.get(key);
        if (!item) return null;
        if (Date.now() > item.expire) {
            cache.data.delete(key);
            return null;
        }
        return item.data;
    },
    set: (key, data, type = 'category') => {
        cache.data.set(key, {
            data,
            expire: Date.now() + cache.ttl[type]
        });
        if (cache.data.size > 200) cache.data.clear();
    }
};

/**
 * RSA 解密工具
 */
const rsaTool = {
    decode: (data) => {
        if (!data) return null;
        try {
            const buffer = Buffer.from(data, 'base64');
            const blockSize = 256;
            let decryptedParts = [];

            for (let i = 0; i < buffer.length; i += blockSize) {
                const chunk = buffer.slice(i, i + blockSize);
                const decChunk = crypto.privateDecrypt({
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                }, chunk);

                decryptedParts.push(decChunk);
            }
            return Buffer.concat(decryptedParts).toString('utf8').trim();
        } catch (e) {
            OmniBox.log('error', `[瓜子APP] RSA解密失败: ${e.message}`);
            return null;
        }
    }
};

/**
 * 加密工具
 */
const cryptoTool = {
    md5: (text) => crypto.createHash('md5').update(text).digest('hex'),
    
    aesEncrypt: (text) => {
        try {
            const key = Buffer.from('mvXBSW7ekreItNsT', 'utf8');
            const iv = Buffer.from('2U3IrJL8szAKp0Fj', 'utf8');
            const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted.toUpperCase();
        } catch (e) {
            OmniBox.log('error', `[瓜子APP] AES加密失败: ${e.message}`);
            return '';
        }
    },
    
    aesDecrypt: (text, keyStr, ivStr) => {
        try {
            const key = Buffer.from(keyStr, 'utf8');
            const iv = Buffer.from(ivStr, 'utf8');
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            decipher.setAutoPadding(true);
            let decrypted = decipher.update(text, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (e) {
            OmniBox.log('error', `[瓜子APP] AES解密失败: ${e.message}`);
            return '';
        }
    },
    
    generateSignature: (requestKey, timestamp) => {
        try {
            const signStr = `token_id=,token=${token},phone_type=1,request_key=${requestKey},app_id=1,time=${timestamp},keys=${staticKeys}*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br`;
            return cryptoTool.md5(signStr);
        } catch (e) {
            logError('生成签名失败', e);
            return '';
        }
    }
};

/**
 * 日志工具
 */
const logInfo = (message, data = null) => {
    if (data) {
        OmniBox.log("info", `[瓜子APP] ${message}: ${JSON.stringify(data)}`);
    } else {
        OmniBox.log("info", `[瓜子APP] ${message}`);
    }
};

const logError = (message, error) => {
    OmniBox.log("error", `[瓜子APP] ${message}: ${error.message || error}`);
};

const logWarn = (message) => {
    OmniBox.log("warn", `[瓜子APP] ${message}`);
};

/**
 * 弹幕工具函数
 */
const preprocessTitle = (title) => {
    if (!title) return "";
    return title
        .replace(/4[kK]|[xX]26[45]|720[pP]|1080[pP]|2160[pP]/g, " ")
        .replace(/[hH]\.?26[45]/g, " ")
        .replace(/BluRay|WEB-DL|HDR|REMUX/gi, " ")
        .replace(/\.mp4|\.mkv|\.avi|\.flv/gi, " ");
};

const chineseToArabic = (cn) => {
    const map = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    if (!isNaN(cn)) return parseInt(cn, 10);
    if (cn.length === 1) return map[cn] || cn;
    if (cn.length === 2) {
        if (cn[0] === '十') return 10 + (map[cn[1]] || 0);
        if (cn[1] === '十') return map[cn[0]] * 10;
    }
    if (cn.length === 3) return map[cn[0]] * 10 + map[cn[2]];
    return cn;
};

const extractEpisode = (title) => {
    if (!title) return "";
    const processedTitle = preprocessTitle(title).trim();

    const cnMatch = processedTitle.match(/第\s*([零一二三四五六七八九十0-9]+)\s*[集话章节回期]/);
    if (cnMatch) return String(chineseToArabic(cnMatch[1]));

    const seMatch = processedTitle.match(/[Ss](?:\d{1,2})?[-._\s]*[Ee](\d{1,3})/i);
    if (seMatch) return seMatch[1];

    const epMatch = processedTitle.match(/\b(?:EP|E)[-._\s]*(\d{1,3})\b/i);
    if (epMatch) return epMatch[1];

    const bracketMatch = processedTitle.match(/[\[\(【(](\d{1,3})[\]\)】)]/);
    if (bracketMatch) {
        const num = bracketMatch[1];
        if (!["720", "1080", "480"].includes(num)) return num;
    }

    return "";
};

const buildFileNameForDanmu = (vodName, episodeTitle) => {
    if (!vodName) return "";
    if (!episodeTitle || episodeTitle === '正片' || episodeTitle === '播放') return vodName;

    const digits = extractEpisode(episodeTitle);
    if (digits) {
        const epNum = parseInt(digits, 10);
        if (epNum > 0) {
            if (epNum < 10) return `${vodName} S01E0${epNum}`;
            return `${vodName} S01E${epNum}`;
        }
    }
    return vodName;
};

const buildScrapedDanmuFileName = (scrapeData, scrapeType, mapping, fallbackVodName, fallbackEpisodeName) => {
    if (!scrapeData) {
        return buildFileNameForDanmu(fallbackVodName, fallbackEpisodeName);
    }

    if (scrapeType === 'movie') {
        return scrapeData.title || fallbackVodName;
    }

    const title = scrapeData.title || fallbackVodName;
    const seasonAirYear = scrapeData.seasonAirYear || '';
    const seasonNumber = mapping?.seasonNumber || 1;
    const episodeNumber = mapping?.episodeNumber || 1;
    return `${title}.${seasonAirYear}.S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`;
};

const matchDanmu = async (fileName) => {
    if (!DANMU_API || !fileName) return [];

    try {
        logInfo(`匹配弹幕: ${fileName}`);
        const matchUrl = `${DANMU_API}/api/v2/match`;
        const response = await OmniBox.request(matchUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            body: JSON.stringify({ fileName }),
            timeout: 10000
        });

        if (response.statusCode !== 200) {
            logInfo(`弹幕匹配失败: HTTP ${response.statusCode}`);
            return [];
        }

        const matchData = JSON.parse(response.body);
        if (!matchData.isMatched) return [];

        const matches = matchData.matches || [];
        if (matches.length === 0) return [];

        const firstMatch = matches[0];
        const episodeId = firstMatch.episodeId;
        const animeTitle = firstMatch.animeTitle || "";
        const episodeTitle = firstMatch.episodeTitle || "";
        if (!episodeId) return [];

        let danmakuName = "弹幕";
        if (animeTitle && episodeTitle) {
            danmakuName = `${animeTitle} - ${episodeTitle}`;
        } else if (animeTitle) {
            danmakuName = animeTitle;
        } else if (episodeTitle) {
            danmakuName = episodeTitle;
        }

        return [{
            name: danmakuName,
            url: `${DANMU_API}/api/v2/danmaku/${episodeId}`,
            type: "danmaku"
        }];
    } catch (e) {
        logError("弹幕匹配失败", e);
        return [];
    }
};

/**
 * 构建请求参数
 */
const buildRequestParams = (requestKey, data = {}) => {
    const timestamp = Date.now().toString();
    const sign = cryptoTool.generateSignature(requestKey, timestamp);
    
    const params = {
        token_id: "",
        token: token,
        phone_type: 1,
        request_key: requestKey,
        app_id: 1,
        time: timestamp,
        sign: sign,
        data: cryptoTool.aesEncrypt(JSON.stringify(data))
    };
    
    return params;
};

/**
 * 通用请求函数
 */
const requestApi = async (path, data = {}) => {
    // 优先从缓存获取
    const cacheKey = `${path}_${JSON.stringify(data)}`;
    const cacheData = cache.get(cacheKey);
    if (cacheData) {
        logInfo(`从缓存获取数据: ${cacheKey}`);
        return cacheData;
    }

    try {
        const requestKey = path.replace(/\/|App/g, '');
        const params = buildRequestParams(requestKey, data);
        
        logInfo(`请求API: ${config.host}${path}`, { params: JSON.stringify(params).substring(0, 100) });
        
        const response = await axiosInstance.post(config.host + path, new URLSearchParams(params), {
            headers: {
                ...config.headers,
                'Content-Length': new URLSearchParams(params).toString().length
            }
        });

        if (!response.data) {
            throw new Error("空响应");
        }

        // 解密响应数据
        let result = response.data;
        if (result.data && typeof result.data === 'string') {
            const decrypted = rsaTool.decode(result.data);
            if (decrypted) {
                result = JSON.parse(decrypted);
            }
        }

        // 缓存数据
        cache.set(cacheKey, result, 'category');
        
        logInfo(`API请求成功: ${path}`, { code: result.code, dataLength: result.data ? JSON.stringify(result.data).length : 0 });
        return result;
    } catch (e) {
        logError(`API请求失败: ${path}`, e);
        // 返回兜底空数据，避免脚本崩溃
        return { code: -1, msg: e.message, data: [] };
    }
};

/**
 * 格式化视频列表
 */
const formatVodList = (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => item.d_id && item.d_title).map(item => ({
        vod_id: String(item.d_id),
        vod_name: item.d_title || '未知标题',
        vod_pic: item.d_pic || '',
        vod_remarks: item.d_mask || (item.d_score ? `评分:${item.d_score}` : '')
    }));
};

/**
 * 获取分类列表
 */
const getCategoryList = async (tid, pg = 1, extend = {}) => {
    try {
        logInfo('获取分类列表', { tid, pg, extend });
        
        const data = {
            type_id: tid,
            page: pg,
            year: extend.year || '0',
            area: extend.area || '0',
            sort: extend.sort || 'd_id'
        };

        const result = await requestApi(API_PATHS.INDEX_LIST, data);
        
        if (result.code !== 1 || !result.data) {
            logWarn(`分类列表无数据: code=${result.code}`);
            return { list: [], page: pg, pagecount: pg, limit: 20 };
        }

        const list = formatVodList(result.data);
        const hasMore = list.length >= 20;

        return {
            list: list,
            page: pg,
            pagecount: hasMore ? pg + 1 : pg,
            limit: 20
        };
    } catch (e) {
        logError('获取分类列表失败', e);
        return { list: [], page: pg, pagecount: pg, limit: 20 };
    }
};

/**
 * 获取视频详情
 */
const getVodDetail = async (vodId) => {
    try {
        logInfo('获取视频详情', { vodId });
        
        const result = await requestApi(API_PATHS.PLAY_INFO, { d_id: vodId });
        
        if (result.code !== 1 || !result.data) {
            throw new Error(`详情获取失败: ${result.msg || '无数据'}`);
        }

        const detail = result.data[0] || {};
        return {
            vod_id: String(detail.d_id),
            vod_name: detail.d_title || '',
            vod_pic: detail.d_pic || '',
            vod_remarks: detail.d_mask || '',
            vod_actor: detail.d_actor || '',
            vod_director: detail.d_director || '',
            vod_content: detail.d_content || '',
            vod_year: detail.d_year || '',
            vod_area: detail.d_area || '',
            vod_type: detail.d_type || ''
        };
    } catch (e) {
        logError('获取视频详情失败', e);
        // 返回兜底数据
        return {
            vod_id: vodId,
            vod_name: '未知视频',
            vod_pic: '',
            vod_remarks: '',
            vod_actor: '',
            vod_director: '',
            vod_content: '',
            vod_year: '',
            vod_area: '',
            vod_type: ''
        };
    }
};

/**
 * 获取播放地址
 */
const getPlayUrl = async (vodId, episode = 1) => {
    try {
        logInfo('获取播放地址', { vodId, episode });
        
        const result = await requestApi(API_PATHS.VURL_DETAIL, {
            d_id: vodId,
            v_id: episode
        });

        if (result.code !== 1 || !result.data) {
            throw new Error(`播放地址获取失败: ${result.msg || '无数据'}`);
        }

        // 过滤无效线路
        const playList = (result.data || []).filter(item => 
            item.v_url && !item.v_url.includes('FTP') && !item.v_url.includes('VIP')
        );

        // 构建播放地址列表
        const urls = playList.map((item, index) => ({
            name: `线路${index + 1}`,
            url: item.v_url,
            // 弹幕适配
            danmaku: await matchDanmu(buildFileNameForDanmu(result.data[0]?.d_title || '', item.v_name))
        }));

        return urls;
    } catch (e) {
        logError('获取播放地址失败', e);
        return [{ name: '默认线路', url: '', danmaku: [] }];
    }
};

/**
 * 搜索功能
 */
const searchVod = async (wd, pg = 1) => {
    try {
        logInfo('搜索视频', { keyword: wd, page: pg });
        
        const result = await requestApi(API_PATHS.FIND_MORE, {
            keyword: wd,
            page: pg
        });

        if (result.code !== 1) {
            logWarn(`搜索无结果: ${result.msg}`);
            return { list: [], page: pg, pagecount: pg, limit: 20 };
        }

        const list = formatVodList(result.data);
        const hasMore = list.length >= 20;

        return {
            list: list,
            page: pg,
            pagecount: hasMore ? pg + 1 : pg,
            limit: 20
        };
    } catch (e) {
        logError('搜索失败', e);
        return { list: [], page: pg, pagecount: pg, limit: 20 };
    }
};

/**
 * 首页入口
 */
async function home(params) {
    try {
        logInfo('处理首页请求');
        
        // 获取首页推荐数据
        const recommendResult = await requestApi(API_PATHS.INDEX_LIST, {
            type_id: '1',
            page: 1,
            year: '0',
            area: '0',
            sort: 'd_score'
        });

        const recommendList = formatVodList(recommendResult.data || []);

        return {
            class: CLASSES,
            filters: FILTERS,
            list: recommendList
        };
    } catch (e) {
        logError('首页请求失败', e);
        return {
            class: CLASSES, // 保底返回分类配置
            filters: FILTERS,
            list: []
        };
    }
}

/**
 * 分类入口
 */
async function category(params) {
    const { tid = '1', pg = 1, extend = {} } = params;
    return await getCategoryList(tid, pg, extend);
}

/**
 * 详情入口
 */
async function detail(params) {
    const { vod_id } = params;
    if (!vod_id) {
        logError('详情请求缺少vod_id');
        return {};
    }
    return await getVodDetail(vod_id);
}

/**
 * 播放入口
 */
async function play(params) {
    const { vod_id, episode = 1 } = params;
    if (!vod_id) {
        logError('播放请求缺少vod_id');
        return [];
    }
    return await getPlayUrl(vod_id, episode);
}

/**
 * 搜索入口
 */
async function search(params) {
    const { wd = '', pg = 1 } = params;
    if (!wd) {
        return { list: [], page: 1, pagecount: 1, limit: 20 };
    }
    return await searchVod(wd, pg);
}

/**
 * 导出OmniBox接口
 */
module.exports = {
    home,
    category,
    detail,
    play,
    search
};