import { RouteMeta } from '../types';

export const ROUTES: RouteMeta[] = [
  { id: 'Route 1 - Downtown Express', type: 'Bus', stops: 12, baseDelay: 3.5 },
  { id: 'Route 2 - Metro Red Line', type: 'Subway', stops: 18, baseDelay: 1.2 },
  { id: 'Route 3 - Blue Crosstown', type: 'Bus', stops: 16, baseDelay: 4.8 },
  { id: 'Route 4 - Airport Direct', type: 'Commuter Rail', stops: 6, baseDelay: 1.5 },
  { id: 'Route 5 - University Shuttle', type: 'Light Rail', stops: 10, baseDelay: 2.1 },
  { id: 'Route 6 - Harbor Connector', type: 'BRT', stops: 8, baseDelay: 2.8 },
  { id: 'Route 7 - North Suburban', type: 'Commuter Rail', stops: 14, baseDelay: 3.2 },
  { id: 'Route 8 - Tech District Loop', type: 'Light Rail', stops: 9, baseDelay: 2.0 },
];

export const STATIONS = [
  'Central Station',
  'Grand Terminal',
  'Innovation District',
  'Financial Center',
  'Airport Hub',
  'University Square',
  'Civic Plaza',
  'Northgate Interchange',
  'Harbor Pier',
  'Greenwood Junction',
];

export const CLASSIFICATION_MODELS = [
  {
    name: 'XGBoost Classifier',
    status: 'Selected Best',
    accuracy: 0.926,
    f1Score: 0.918,
    rocAuc: 0.971,
    precision: 0.915,
    recall: 0.922,
    trainTime: '0.88s',
  },
  {
    name: 'Random Forest',
    status: 'Candidate',
    accuracy: 0.912,
    f1Score: 0.904,
    rocAuc: 0.958,
    precision: 0.898,
    recall: 0.911,
    trainTime: '1.15s',
  },
  {
    name: 'Logistic Regression',
    status: 'Baseline',
    accuracy: 0.884,
    f1Score: 0.871,
    rocAuc: 0.932,
    precision: 0.865,
    recall: 0.878,
    trainTime: '0.42s',
  },
];

export const REGRESSION_MODELS = [
  {
    name: 'LightGBM Regressor',
    status: 'Selected Best',
    mae: 1.78,
    rmse: 2.39,
    r2: 0.864,
    trainTime: '0.74s',
  },
  {
    name: 'XGBoost Regressor',
    status: 'Top Performer',
    mae: 1.62,
    rmse: 2.21,
    r2: 0.887,
    trainTime: '0.92s',
  },
  {
    name: 'Ridge Regression',
    status: 'Baseline',
    mae: 2.14,
    rmse: 2.85,
    r2: 0.812,
    trainTime: '0.08s',
  },
];

export const DELAY_DISTRIBUTION = [
  { bin: '0-2 min', count: 1820, percent: 36.4 },
  { bin: '2-4 min', count: 1470, percent: 29.4 },
  { bin: '4-6 min', count: 730, percent: 14.6 },
  { bin: '6-8 min', count: 420, percent: 8.4 },
  { bin: '8-10 min', count: 280, percent: 5.6 },
  { bin: '10-15 min', count: 190, percent: 3.8 },
  { bin: '>15 min', count: 90, percent: 1.8 },
];

export const ROUTE_PERFORMANCE = [
  { route: 'Metro Red Line (Subway)', delay: 1.8, reliability: 94.2, sensitivity: 'Very Low' },
  { route: 'Airport Direct (Rail)', delay: 2.4, reliability: 91.5, sensitivity: 'Low' },
  { route: 'University Shuttle (Light Rail)', delay: 3.1, reliability: 88.0, sensitivity: 'Moderate' },
  { route: 'Tech District Loop (Light Rail)', delay: 3.6, reliability: 86.4, sensitivity: 'Moderate' },
  { route: 'North Suburban (Rail)', delay: 4.8, reliability: 81.2, sensitivity: 'Moderate' },
  { route: 'Harbor Connector (BRT)', delay: 5.6, reliability: 76.5, sensitivity: 'High' },
  { route: 'Downtown Express (Bus)', delay: 7.9, reliability: 64.1, sensitivity: 'Critical' },
  { route: 'Blue Crosstown (Bus)', delay: 8.8, reliability: 59.8, sensitivity: 'Critical' },
];

export const WEATHER_IMPACT = [
  { condition: 'Clear', avgDelay: 3.2, delayProbability: 21.0, count: 2500 },
  { condition: 'Fog', avgDelay: 5.4, delayProbability: 38.5, count: 250 },
  { condition: 'Rain', avgDelay: 6.8, delayProbability: 51.2, count: 1250 },
  { condition: 'Heavy Rain', avgDelay: 11.2, delayProbability: 79.4, count: 600 },
  { condition: 'Snow', avgDelay: 13.8, delayProbability: 86.5, count: 400 },
];
