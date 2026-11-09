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
} from 'lucide-react'

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
}

export default function WeatherIcon({ iconName, size = 48, color = 'currentColor', className = '' }) {
  const IconComponent = ICON_MAP[iconName] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={2} className={className} />
}

