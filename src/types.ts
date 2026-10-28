export type RiskCategory = 'Low' | 'Moderate' | 'High';

export type VehicleType = 'Bus' | 'Subway' | 'Light Rail' | 'Commuter Rail' | 'BRT';

export type WeatherCondition = 'Clear' | 'Rain' | 'Heavy Rain' | 'Snow' | 'Fog';

export interface TripParameters {
  trip_id: string;
  route_id: string;
  vehicle_type: VehicleType;
  station_origin: string;
  station_destination: string;
  scheduled_hour: number;
  scheduled_minute: number;
  day_of_week: number;
  weather_condition: WeatherCondition;
  temperature_c: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  traffic_congestion_index: number;
  is_holiday: boolean;
  major_event_nearby: boolean;
}

export interface PredictionResult {
  trip_id: string;
  is_delayed: boolean;
  delay_probability: number;
  risk_category: RiskCategory;
  predicted_delay_minutes: number;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
  };
  reliability_score: number;
  classification_model: string;
  regression_model: string;
}

export interface FeatureContribution {
  feature_name: string;
  raw_value: string;
  contribution: number;
  impact_direction: 'increases_delay' | 'decreases_delay';
  human_explanation: string;
}

export interface ExplainabilityResult {
  base_delay_probability: number;
  predicted_delay_minutes: number;
  risk_category: RiskCategory;
  top_contributions: FeatureContribution[];
  risk_summary: string;
  actionable_recommendations: string[];
}

export interface RouteMeta {
  id: string;
  type: VehicleType;
  stops: number;
  baseDelay: number;
}
