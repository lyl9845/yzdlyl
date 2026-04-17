// @name 瓜子APP
// @author 
// @description 刮削：支持，弹幕：支持，嗅探：支持
// @version 1.0.8

// 基础配置
const config = {
    host: 'https://api.w32z7vtd.com',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'okhttp/3.12.0',
        'Referer': 'https://api.w32z7vtd.com'
    }
};

// 分类配置
const CLASSES = [
    { type_id: "1", type_name: "电影" },
    { type_id: "2", type_name: "电视剧" },
    { type_id: "4", type_name: "动漫" },
    { type_id: "3", type_name: "综艺" },
    { type_id: "64", type_name: "短剧" }
];

// 筛选配置
const FILTERS = {
    '1': [
        { key: 'year', name: '年份', init: '0', value: [
            { name: '全部', value: '0' },
            { name: '2025', value: '2025' },
            { name: '2024', value: '2024' },
            { name: '2023', value: '2023' }
        ]},
        { key: 'sort', name: '排序', init: 'd_id', value: [
            { name: '最新', value: 'd_id' },
            { name: '最热', value: 'd_hits' }
        ]}
    ]
};

// 构建请求参数
function buildParams(data) {
    const token = '1be86e8e18a9fa18b2b8d5432699dad0.ac008ed650fd087bfbecf2fda9d82e9835253ef24843e6b18fcd128b10763497bcf9d53e959f5377cde038c20ccf9d17f604c9b8bb6e61041def86729b2fc7408bd241e23c213ac57f0226ee656e2bb0a583ae0e4f3bf6c6ab6c490c9a6f0d8cdfd366aacf5d83193671a8f77cd1af1ff2e9145de92ec43ec87cf4bdc563f6e919fe32861b0e93b118ec37d8035fbb3c.59dd05c5d9a8ae726528783128218f15fe6f2c0c8145eddab112b374fcfe3d79';
    const staticKeys = "Qmxi5ciWXbQzkr7o+SUNiUuQxQEf8/AVyUWY4T/BGhcXBIUz4nOyHBGf9A4KbM0iKF3yp9M7WAY0rrs5PzdTAOB45plcS2zZ0wUibcXuGJ29VVGRWKGwE9zu2vLwhfgjTaaDpXo4rby+7GxXTktzJmxvneOUdYeHi+PZsThlvPI=";
    const timestamp = Date.now().toString();
    const sign = timestamp.substring(0, 10); // 简化签名
    
    const params = {
        token_id: "",
        token: token,
        phone_type: 1,
        request_key: "indexlist",
        app_id: 1,
        time: timestamp,
        sign: sign,
        data: JSON.stringify(data)
    };
    
    return params;
}

// 通用请求函数
async function requestApi(path, data = {}) {
    try {
        const params = buildParams(data);
        const body = Object.keys(params).map(key => 
            encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        ).join('&');
        
        const response = await fetch(config.host + path, {
            method: 'POST',
            headers: config.headers,
            body: body
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (e) {
        console.error('API请求失败:', e);
        return { code: -1, data: [] };
    }
}

// 格式化视频数据
function formatVodList(data) {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
        vod_id: item.d_id || item.id || Math.random(),
        vod_name: item.d_title || item.title || '未知标题',
        vod_pic: item.d_pic || item.pic || '',
        vod_remarks: item.d_mask || item.mask || '',
        vod_year: item.d_year || item.year || '',
        vod_area: item.d_area || item.area || '',
        vod_type: item.d_type || item.type || ''
    }));
}

// 首页数据
async function getHomeData() {
    try {
        const result = await requestApi('/App/IndexList/indexList', {
            type_id: '1',
            page: 1
        });
        
        if (result.code === 1) {
            return formatVodList(result.data);
        }
        return [];
    } catch (e) {
        return [];
    }
}

// 首页
async function home(params) {
    const list = await getHomeData();
    return {
        class: CLASSES,
        filters: FILTERS,
        list: list
    };
}

// 分类
async function category(params) {
    const tid = params.tid || '1';
    const pg = params.pg || 1;
    const extend = params.extend || {};
    
    try {
        const result = await requestApi('/App/IndexList/indexList', {
            type_id: tid,
            page: pg,
            year: extend.year || '0',
            area: extend.area || '0',
            sort: extend.sort || 'd_id'
        });
        
        if (result.code === 1) {
            const list = formatVodList(result.data);
            return {
                list: list,
                page: pg,
                pagecount: list.length >= 20 ? pg + 1 : pg,
                limit: 20,
                total: list.length
            };
        }
    } catch (e) {}
    
    return { list: [], page: pg, pagecount: pg, limit: 20, total: 0 };
}

// 详情
async function detail(params) {
    const vod_id = params.vod_id;
    if (!vod_id) return {};
    
    try {
        const result = await requestApi('/App/IndexPlay/playInfo', { d_id: vod_id });
        
        if (result.code === 1 && Array.isArray(result.data) && result.data.length > 0) {
            const detail = result.data[0];
            return {
                vod_id: detail.d_id || vod_id,
                vod_name: detail.d_title || '未知视频',
                vod_pic: detail.d_pic || '',
                vod_remarks: detail.d_mask || '',
                vod_actor: detail.d_actor || '',
                vod_director: detail.d_director || '',
                vod_content: detail.d_content || '',
                vod_year: detail.d_year || '',
                vod_area: detail.d_area || '',
                vod_type: detail.d_type || '',
                vod_class: detail.d_class || ''
            };
        }
    } catch (e) {}
    
    return {
        vod_id: vod_id,
        vod_name: '未知视频',
        vod_pic: '',
        vod_remarks: '',
        vod_actor: '',
        vod_director: '',
        vod_content: '',
        vod_year: '',
        vod_area: '',
        vod_type: '',
        vod_class: ''
    };
}

// 播放
async function play(params) {
    const vod_id = params.vod_id;
    if (!vod_id) return [];
    
    try {
        const result = await requestApi('/App/Resource/VurlDetail/showOne', {
            d_id: vod_id,
            v_id: 1
        });
        
        if (result.code === 1 && result.data) {
            return [{
                name: '线路1',
                url: result.data.v_url || result.data.url || '',
                flag: ['瓜子APP']
            }];
        }
    } catch (e) {}
    
    return [{ name: '默认线路', url: '', flag: ['瓜子APP'] }];
}

// 搜索
async function search(params) {
    const wd = params.wd || '';
    const pg = params.pg || 1;
    
    if (!wd) {
        return { list: [], page: 1, pagecount: 1, limit: 20, total: 0 };
    }
    
    try {
        const result = await requestApi('/App/Index/findMoreVod', {
            keyword: wd,
            page: pg
        });
        
        if (result.code === 1) {
            const list = formatVodList(result.data);
            return {
                list: list,
                page: pg,
                pagecount: list.length >= 20 ? pg + 1 : pg,
                limit: 20,
                total: list.length
            };
        }
    } catch (e) {}
    
    return { list: [], page: pg, pagecount: pg, limit: 20, total: 0 };
}

// 导出接口
return {
    home,
    category,
    detail,
    play,
    search
};
