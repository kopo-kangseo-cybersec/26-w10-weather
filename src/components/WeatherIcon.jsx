import {
  Sun,
  SunDim,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
} from 'lucide-react'

const ICON_MAP = {
  Sun,
  SunDim,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

// 16픽셀 기본 크기로 통일
export default function WeatherIcon({ iconName, size = 16, color = 'currentColor', className = '' }) {
  const IconComponent = ICON_MAP[iconName] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={2} className={className} />
}
