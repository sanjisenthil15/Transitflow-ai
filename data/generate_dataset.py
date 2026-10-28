#!/usr/bin/env python3
"""
TransitFlow - Dataset Generator
Generates a realistic synthetic dataset for public transport arrival delays
with ground-truth physical and environmental dynamics.
Uses Python standard library only for zero-dependency execution.
"""

import csv
import math
import os
import random

def generate_transit_data(n_samples=5000, output_path="data/public_transport_delays.csv", seed=42):
    random.seed(seed)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    routes = [
        {"id": "Route 1 - Downtown Express", "type": "Bus", "base_delay": 3.0, "var": 4.0},
        {"id": "Route 2 - Metro Red Line", "type": "Subway", "base_delay": 1.2, "var": 2.0},
        {"id": "Route 3 - Blue Crosstown", "type": "Bus", "base_delay": 4.5, "var": 5.0},
        {"id": "Route 4 - Airport Direct", "type": "Commuter Rail", "base_delay": 1.5, "var": 3.0},
        {"id": "Route 5 - University Shuttle", "type": "Light Rail", "base_delay": 2.0, "var": 2.5},
        {"id": "Route 6 - Harbor Connector", "type": "BRT", "base_delay": 2.8, "var": 3.5},
        {"id": "Route 7 - North Suburban", "type": "Commuter Rail", "base_delay": 3.2, "var": 4.2},
        {"id": "Route 8 - Tech District Loop", "type": "Light Rail", "base_delay": 2.1, "var": 2.8},
    ]

    stations = [
        "Central Station",
        "Grand Terminal",
        "Innovation District",
        "Financial Center",
        "Airport Hub",
        "University Square",
        "Civic Plaza",
        "Northgate Interchange",
        "Harbor Pier",
        "Greenwood Junction",
    ]

    weather_types = [
        ("Clear", 0.50, 0.0, 1.0),
        ("Rain", 0.25, 4.0, 1.3),
        ("Heavy Rain", 0.12, 10.0, 1.8),
        ("Snow", 0.08, 14.0, 2.2),
        ("Fog", 0.05, 6.0, 1.4),
    ]

    fieldnames = [
        "trip_id",
        "route_id",
        "vehicle_type",
        "station_origin",
        "station_destination",
        "scheduled_hour",
        "scheduled_minute",
        "day_of_week",
        "weather_condition",
        "temperature_c",
        "precipitation_mm",
        "wind_speed_kmh",
        "traffic_congestion_index",
        "is_holiday",
        "major_event_nearby",
        "delay_minutes",
        "is_delayed",
    ]

    with open(output_path, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(1, n_samples + 1):
            trip_id = f"TF-{10000 + i}"
            route = random.choice(routes)
            route_id = route["id"]
            vehicle_type = route["type"]

            # Stations
            orig = random.choice(stations)
            dest = random.choice([s for s in stations if s != orig])

            # Time parameters
            # Bias towards rush hours: 7-9 AM and 4-7 PM
            if random.random() < 0.45:
                scheduled_hour = random.choice([7, 8, 9, 16, 17, 18, 19])
            elif random.random() < 0.35:
                scheduled_hour = random.choice([10, 11, 12, 13, 14, 15, 20, 21])
            else:
                scheduled_hour = random.choice([0, 1, 2, 3, 4, 5, 6, 22, 23])

            scheduled_minute = random.choice([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
            day_of_week = random.randint(0, 6) # 0=Monday, 6=Sunday

            # Weather
            w_rand = random.random()
            cum = 0.0
            chosen_weather = weather_types[0]
            for w, prob, add_delay, mult in weather_types:
                cum += prob
                if w_rand <= cum:
                    chosen_weather = (w, prob, add_delay, mult)
                    break

            weather_name, _, w_delay_add, w_mult = chosen_weather

            # Temperature and precipitation based on weather
            if weather_name == "Clear":
                temp = round(random.gauss(21.0, 5.0), 1)
                precip = 0.0
                wind = round(random.uniform(5.0, 18.0), 1)
            elif weather_name == "Rain":
                temp = round(random.gauss(15.0, 4.0), 1)
                precip = round(random.uniform(1.0, 8.0), 1)
                wind = round(random.uniform(12.0, 30.0), 1)
            elif weather_name == "Heavy Rain":
                temp = round(random.gauss(13.0, 3.5), 1)
                precip = round(random.uniform(8.0, 25.0), 1)
                wind = round(random.uniform(25.0, 55.0), 1)
            elif weather_name == "Snow":
                temp = round(random.gauss(-2.0, 3.0), 1)
                precip = round(random.uniform(2.0, 15.0), 1)
                wind = round(random.uniform(15.0, 40.0), 1)
            else: # Fog
                temp = round(random.gauss(9.0, 3.0), 1)
                precip = round(random.uniform(0.0, 1.0), 1)
                wind = round(random.uniform(2.0, 10.0), 1)

            # Rush hour factor
            is_morning_rush = 7 <= scheduled_hour <= 9 and day_of_week < 5
            is_evening_rush = 16 <= scheduled_hour <= 19 and day_of_week < 5
            is_rush_hour = is_morning_rush or is_evening_rush

            # Traffic congestion index (0.05 to 0.98)
            base_congestion = 0.65 if is_rush_hour else 0.28
            if day_of_week in [5, 6]:
                base_congestion *= 0.75
            traffic_congestion = min(0.98, max(0.05, round(random.gauss(base_congestion, 0.15), 2)))

            is_holiday = 1 if (random.random() < 0.05 and day_of_week < 5) else 0
            major_event = 1 if (random.random() < 0.12) else 0

            # Delay computation physics
            # Vehicle vulnerability to traffic:
            # Bus > BRT > Light Rail > Commuter Rail > Subway
            traffic_sensitivity = {
                "Bus": 12.0,
                "BRT": 7.0,
                "Light Rail": 4.0,
                "Commuter Rail": 2.5,
                "Subway": 0.8,
            }[vehicle_type]

            # Route baseline delay
            delay = route["base_delay"]
            delay += traffic_congestion * traffic_sensitivity
            delay += w_delay_add * 0.7
            if major_event:
                delay += random.uniform(3.5, 9.0)
            if is_rush_hour:
                delay += random.uniform(2.0, 6.0)

            # Random noise
            noise = random.gauss(0, route["var"] * 0.5)
            delay = max(0.0, delay + noise)
            delay_minutes = round(delay, 1)

            # Threshold: >= 5.0 minutes is considered delayed
            is_delayed = 1 if delay_minutes >= 5.0 else 0

            # Occasionally introduce realistic missing values for testing imputation
            record = {
                "trip_id": trip_id,
                "route_id": route_id,
                "vehicle_type": vehicle_type,
                "station_origin": orig,
                "station_destination": dest,
                "scheduled_hour": scheduled_hour,
                "scheduled_minute": scheduled_minute,
                "day_of_week": day_of_week,
                "weather_condition": weather_name,
                "temperature_c": "" if random.random() < 0.015 else temp,
                "precipitation_mm": "" if random.random() < 0.015 else precip,
                "wind_speed_kmh": "" if random.random() < 0.015 else wind,
                "traffic_congestion_index": "" if random.random() < 0.01 else traffic_congestion,
                "is_holiday": is_holiday,
                "major_event_nearby": major_event,
                "delay_minutes": delay_minutes,
                "is_delayed": is_delayed,
            }

            writer.writerow(record)

    print(f"Generated {n_samples} transit trip records at: {output_path}")

if __name__ == "__main__":
    generate_transit_data(5000, "data/public_transport_delays.csv")
