// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 备用音乐接口：博客自带的 Meting 代理，与主页同属 liwezee.cn，
// 已验证可返回歌单 JSON 且允许 liwezee.cn 跨域访问
const FALLBACK_SONG_API = "https://blog.liwezee.cn/wp-json/sakura/v1/meting/aplayer";

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const apis = [import.meta.env.VITE_SONG_API, FALLBACK_SONG_API].filter(Boolean);
  let lastError = null;
  for (const api of apis) {
    try {
      const res = await fetch(
        `${api.replace(/\/$/, "")}?server=${server}&type=${type}&id=${id}`,
      );
      const data = await res.json();
      if (!Array.isArray(data) || !data.length || !data[0].url) {
        throw new Error("歌单为空或格式不正确");
      }

      if (data[0].url.startsWith("@")) {
        // eslint-disable-next-line no-unused-vars
        const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
        const jsonpData = await fetchJsonp(url).then((res) => res.json());
        const domain = (
          jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
          jsonpData.req_0.data.sip[0]
        ).replace("http://", "https://");

        return data.map((v, i) => ({
          name: v.name || v.title,
          artist: v.artist || v.author,
          url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
          cover: v.cover || v.pic,
          lrc: v.lrc,
        }));
      } else {
        return data.map((v) => ({
          name: v.name || v.title,
          artist: v.artist || v.author,
          url: v.url,
          cover: v.cover || v.pic,
          lrc: v.lrc,
        }));
      }
    } catch (error) {
      console.warn(`音乐接口 ${api} 获取失败，尝试备用接口：`, error);
      lastError = error;
    }
  }
  throw lastError || new Error("音乐接口全部不可用");
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
  const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
  return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
  const res = await fetch(
    `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`,
  );
  return await res.json();
};

// 常见英文天气描述转中文（备用接口返回英文时使用）
const weatherDescZh = {
  Clear: "晴",
  Sunny: "晴",
  "Partly cloudy": "多云",
  Cloudy: "多云",
  Overcast: "阴",
  Mist: "雾",
  Fog: "雾",
  Haze: "霾",
  "Patchy rain possible": "可能有雨",
  "Light rain": "小雨",
  "Moderate rain": "中雨",
  "Heavy rain": "大雨",
  "Light snow": "小雪",
  "Moderate snow": "中雪",
  "Heavy snow": "大雪",
  Thundery: "雷阵雨",
};

// 获取备用天气（wttr.in，免 Key，根据访问 IP 定位）
// https://github.com/chubin/wttr.in
export const getOtherWeather = async () => {
  const res = await fetch("https://wttr.in/?format=j1&lang=zh");
  const data = await res.json();
  const current = data.current_condition[0];
  const area = data.nearest_area[0];
  // 风速 km/h 换算为蒲福风级
  const kmh = Number(current.windspeedKmph) || 0;
  const scale = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117];
  const beaufort = scale.findIndex((v) => kmh <= v);
  return {
    result: {
      city: { City: area.areaName[0].value || "未知地区" },
      condition: {
        day_weather:
          weatherDescZh[current.weatherDesc[0].value] || current.weatherDesc[0].value || "未知",
        min_degree: current.temp_C,
        max_degree: current.temp_C,
        day_wind_direction: current.winddir16Point,
        day_wind_power: beaufort < 0 ? 12 : beaufort,
      },
    },
  };
};
