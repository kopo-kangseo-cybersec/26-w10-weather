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

/**
 * Open-Meteo WMO 기상 코드 아이콘 매핑 헬퍼
 */
export default function WeatherIcon({ iconName, size = 48, color = '#f59e0b', strokeWidth = 2, className = '' }) {
  const iconProps = { size, color, strokeWidth, className };

  switch (iconName) {
    case 'Sun':
      return <Sun {...iconProps} />;
    case 'SunDim':
      return <SunDim {...iconProps} />;
    case 'CloudSun':
      return <CloudSun {...iconProps} />;
    case 'CloudFog':
      return <CloudFog {...iconProps} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...iconProps} />;
    case 'CloudRain':
      return <CloudRain {...iconProps} />;
    case 'Snowflake':
      return <Snowflake {...iconProps} />;
    case 'CloudLightning':
      return <CloudLightning {...iconProps} />;
    case 'Cloud':
    default:
      return <Cloud {...iconProps} />;
  }
}

