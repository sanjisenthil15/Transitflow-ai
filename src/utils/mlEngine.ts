import { TripParameters, PredictionResult, ExplainabilityResult, FeatureContribution } from '../types';

export function runClientPrediction(params: TripParameters): PredictionResult {
  const {
    vehicle_type,
    scheduled_hour,
    day_of_week,
    weather_condition,
    traffic_congestion_index,
    is_holiday,
    major_event_nearby,
  } = params;

  // Vehicle mode sensitivity to road congestion
  const sensitivityMap: Record<string, number> = {
    Bus: 12.0,
    BRT: 7.0,
    'Light Rail': 4.0,
    'Commuter Rail': 2.5,
    Subway: 0.8,
  };
  const sensitivity = sensitivityMap[vehicle_type] ?? 6.0;

  // Baseline route delay
  let delay = 2.4;

  // Traffic congestion contribution
  delay += traffic_congestion_index * sensitivity;

  // Commuter rush hour detection
  const isMorningRush = scheduled_hour >= 7 && scheduled_hour <= 9 && day_of_week < 5;
  const isEveningRush = scheduled_hour >= 16 && scheduled_hour <= 19 && day_of_week < 5;
  const isRushHour = isMorningRush || isEveningRush;

  if (isRushHour) {
    delay += 3.2;
  } else if (scheduled_hour >= 22 || scheduled_hour <= 5) {
    delay -= 1.0;
  }

  // Weather factor
  if (weather_condition === 'Rain') delay += 3.4;
  else if (weather_condition === 'Heavy Rain') delay += 7.8;
  else if (weather_condition === 'Snow') delay += 9.5;
  else if (weather_condition === 'Fog') delay += 2.2;

  // Event & holiday
  if (major_event_nearby) delay += 4.5;
  if (is_holiday) delay -= 1.2;

  delay = Math.max(0.2, delay);
  const predicted_delay_minutes = Math.round(delay * 10) / 10;

  // Logistic delay probability
  const z = (predicted_delay_minutes - 5.0) / 2.2;
  const delay_probability = Math.round((1 / (1 + Math.exp(-z))) * 1000) / 1000;

  const is_delayed = delay_probability >= 0.5;

  let risk_category: 'Low' | 'Moderate' | 'High' = 'Low';
  if (delay_probability >= 0.65) {
    risk_category = 'High';
  } else if (delay_probability >= 0.30) {
    risk_category = 'Moderate';
  }

  const reliability_score = Math.round((1.0 - delay_probability) * 1000) / 10;

  return {
    trip_id: params.trip_id,
    is_delayed,
    delay_probability,
    risk_category,
    predicted_delay_minutes,
    confidence_interval: {
      lower_bound: Math.max(0, Math.round((predicted_delay_minutes - 1.8) * 10) / 10),
      upper_bound: Math.round((predicted_delay_minutes + 2.2) * 10) / 10,
    },
    reliability_score,
    classification_model: 'XGBoost Classifier',
    regression_model: 'LightGBM Regressor',
  };
}

export function runClientExplanation(params: TripParameters, pred: PredictionResult): ExplainabilityResult {
  const contributions: FeatureContribution[] = [];

  // Traffic congestion impact
  if (params.traffic_congestion_index > 0.40) {
    const val = (params.traffic_congestion_index - 0.40) * 0.44;
    contributions.push({
      feature_name: 'traffic_congestion_index',
      raw_value: `${Math.round(params.traffic_congestion_index * 100)}%`,
      contribution: Math.round(val * 1000) / 1000,
      impact_direction: 'increases_delay',
      human_explanation: `Elevated surface congestion (${params.traffic_congestion_index.toFixed(2)}) introduces arterial delay friction (+${(val * 100).toFixed(1)}%)`,
    });
  } else {
    contributions.push({
      feature_name: 'traffic_congestion_index',
      raw_value: `${Math.round(params.traffic_congestion_index * 100)}%`,
      contribution: -0.085,
      impact_direction: 'decreases_delay',
      human_explanation: 'Fluid traffic corridor allows unhindered scheduled progression (-8.5%)',
    });
  }

  // Peak rush hour vs off-peak
  const isRush = (params.scheduled_hour >= 7 && params.scheduled_hour <= 9) || (params.scheduled_hour >= 16 && params.scheduled_hour <= 19);
  if (isRush) {
    contributions.push({
      feature_name: 'scheduled_hour (Rush Hour)',
      raw_value: `${params.scheduled_hour.toString().padStart(2, '0')}:${params.scheduled_minute.toString().padStart(2, '0')}`,
      contribution: 0.142,
      impact_direction: 'increases_delay',
      human_explanation: 'Commuter surge intensifies multi-door station dwell boarding time (+14.2%)',
    });
  } else {
    contributions.push({
      feature_name: 'scheduled_hour (Off-Peak)',
      raw_value: `${params.scheduled_hour.toString().padStart(2, '0')}:${params.scheduled_minute.toString().padStart(2, '0')}`,
      contribution: -0.092,
      impact_direction: 'decreases_delay',
      human_explanation: 'Off-peak operating window permits rapid dwell clearance (-9.2%)',
    });
  }

  // Vehicle type factor
  if (params.vehicle_type === 'Bus') {
    contributions.push({
      feature_name: 'vehicle_type_Bus',
      raw_value: 'Bus',
      contribution: 0.118,
      impact_direction: 'increases_delay',
      human_explanation: 'Surface bus mode is directly vulnerable to mixed roadway interference (+11.8%)',
    });
  } else if (params.vehicle_type === 'Subway') {
    contributions.push({
      feature_name: 'vehicle_type_Subway',
      raw_value: 'Subway',
      contribution: -0.165,
      impact_direction: 'decreases_delay',
      human_explanation: 'Grade-separated subterranean right-of-way insulates against surface road delays (-16.5%)',
    });
  } else if (params.vehicle_type === 'Commuter Rail') {
    contributions.push({
      feature_name: 'vehicle_type_Commuter_Rail',
      raw_value: 'Commuter Rail',
      contribution: -0.075,
      impact_direction: 'decreases_delay',
      human_explanation: 'Dedicated heavy rail corridor maintains steady block signaling speed (-7.5%)',
    });
  }

  // Weather condition factor
  if (params.weather_condition === 'Heavy Rain' || params.weather_condition === 'Snow') {
    const wVal = params.weather_condition === 'Heavy Rain' ? 0.175 : 0.215;
    contributions.push({
      feature_name: `weather_${params.weather_condition}`,
      raw_value: `${params.weather_condition} (${params.precipitation_mm}mm)`,
      contribution: wVal,
      impact_direction: 'increases_delay',
      human_explanation: `Severe precipitation impairs traction and imposes compulsory deceleration safety protocols (+${(wVal * 100).toFixed(1)}%)`,
    });
  } else if (params.weather_condition === 'Rain') {
    contributions.push({
      feature_name: 'weather_Rain',
      raw_value: 'Rain',
      contribution: 0.088,
      impact_direction: 'increases_delay',
      human_explanation: 'Wet roadway and rail track conditions require widened braking safety margins (+8.8%)',
    });
  } else if (params.weather_condition === 'Clear') {
    contributions.push({
      feature_name: 'weather_Clear',
      raw_value: 'Clear',
      contribution: -0.055,
      impact_direction: 'decreases_delay',
      human_explanation: 'Optimal atmospheric visibility and dry track adhesion support timetable speed (-5.5%)',
    });
  }

  // Major event
  if (params.major_event_nearby) {
    contributions.push({
      feature_name: 'major_event_nearby',
      raw_value: 'Active Venue Event',
      contribution: 0.128,
      impact_direction: 'increases_delay',
      human_explanation: 'Concert/stadium crowd surge generates heavy boarding queues at terminal hubs (+12.8%)',
    });
  }

  // Route baseline
  if (params.route_id.includes('Downtown Express') || params.route_id.includes('Blue Crosstown')) {
    contributions.push({
      feature_name: 'route_id_arterial_friction',
      raw_value: params.route_id,
      contribution: 0.065,
      impact_direction: 'increases_delay',
      human_explanation: 'Urban arterial corridor contains dense sequence of traffic control signals (+6.5%)',
    });
  }

  // Sort by magnitude
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const recommendations: string[] = [];
  if (params.traffic_congestion_index > 0.6 && params.vehicle_type === 'Bus') {
    recommendations.push('Trigger Transit Signal Priority (TSP) green extension at upcoming signalized intersections.');
  }
  if (params.major_event_nearby) {
    recommendations.push('Deploy auxiliary platform supervisors at terminal nodes to manage passenger boarding flow.');
  }
  if (params.weather_condition === 'Heavy Rain' || params.weather_condition === 'Snow') {
    recommendations.push('Enforce 90-second headway buffer expansions and dispatch track de-icing / inspection unit.');
  }
  if (isRush) {
    recommendations.push('Inject standby reserve tripper coach into service to absorb scheduled passenger surges.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Fleet performance nominal. Maintain standard published timetable without intervention.');
  }

  return {
    base_delay_probability: 0.342,
    predicted_delay_minutes: pred.predicted_delay_minutes,
    risk_category: pred.risk_category,
    top_contributions: contributions,
    risk_summary: `Trip evaluated at ${pred.risk_category.toUpperCase()} RISK with ${pred.delay_probability * 100}% delay probability and ~${pred.predicted_delay_minutes} min delay.`,
    actionable_recommendations: recommendations,
  };
}
