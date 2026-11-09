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

const weatherIconMap = {
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

export default function WeatherIcon({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
}) {
  const IconComponent = weatherIconMap[name] || Cloud;
  return <IconComponent size={size} color={color} className={className} />;
}

