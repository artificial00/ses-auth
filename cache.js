const fs = require('fs');
const path = require('path');

const CACHE_DURATION = 60 * 1000;
const CACHE_FILE = path.join(__dirname, 'data_cache.json');

const cache = {
    data: null,
    timestamp: 0
};

async function generateData() {
    return {
        timestamp: Date.now(),
        data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100))
    };
}

async function getCachedData() {
    const now = Date.now();
    
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
        return cache.data;
    }
    
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const fileData = fs.readFileSync(CACHE_FILE, 'utf8');
            const { data, timestamp } = JSON.parse(fileData);
            
            if ((now - timestamp) < CACHE_DURATION) {
                cache.data = data;
                cache.timestamp = timestamp;
                return data;
            }
        }
    } catch (err) {
        console.error('Ошибка чтения кэш-файла:', err);
    }
    
    const newData = await generateData();
    cache.data = newData.data;
    cache.timestamp = now;
    
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify({
            data: newData.data,
            timestamp: now
        }), 'utf8');
    } catch (err) {
        console.error('Ошибка записи кэш-файла:', err);
    }
    
    return newData.data;
}

module.exports = { getCachedData, cache };