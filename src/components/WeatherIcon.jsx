import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Moon,
  CloudMoon
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Moon,
  CloudMoon
};

export default function WeatherIcon({ name, isDay = 1, size = 28, color, className = '' }) {
  // 야간(isDay === 0)일 때 맑은 날씨는 달(Moon)로 변환
  let resolvedName = name;
  if (isDay === 0) {
    if (name === 'Sun' || name === 'SunDim') resolvedName = 'Moon';
    else if (name === 'CloudSun') resolvedName = 'CloudMoon';
  }

  const IconComponent = ICON_MAP[resolvedName] || Cloud;
  return <IconComponent size={size} color={color} className={className} />;
}
