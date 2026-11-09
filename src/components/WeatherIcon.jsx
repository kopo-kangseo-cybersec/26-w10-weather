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
};

export default function WeatherIcon({ name, size = 24, color = '#60a5fa', className = '' }) {
  const IconComponent = ICON_MAP[name] || Cloud;
  return <IconComponent size={size} color={color} className={className} />;
}
