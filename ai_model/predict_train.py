import sys
import json
import joblib
import numpy as np
import os

# ==============================
# PATHS
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ==============================
# LOAD MODEL
# ==============================
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}", file=sys.stderr)
except Exception as e:
    print(f"❌ Failed to load model: {e}", file=sys.stderr)
    sys.exit(1)

def calculate_features(data):
    """
    Calculate derived features to match training model
    
    Expected features from training (in order):
    1. passengers
    2. distance_km
    3. travel_time_hr
    4. load_ratio (passengers / train_capacity)
    5. avg_speed (distance_km / travel_time_hr)
    6. distance_type (0: <150km, 1: 150-400km, 2: >400km)
    7. is_peak_hour
    """
    
    passengers = float(data["passengers"])
    distance_km = float(data["distance_km"])
    travel_time_hr = float(data["travel_time_hr"])
    train_capacity = float(data["train_capacity"])
    is_peak_hour = int(data["is_peak_hour"])
    
    # Calculate derived features
    load_ratio = passengers / train_capacity if train_capacity > 0 else 0
    avg_speed = distance_km / travel_time_hr if travel_time_hr > 0 else 0
    
    # Distance type categorization
    if distance_km < 150:
        distance_type = 0
    elif distance_km < 400:
        distance_type = 1
    else:
        distance_type = 2
    
    # Return features in the EXACT order the model was trained on
    features = [
        passengers,
        distance_km,
        travel_time_hr,
        load_ratio,
        avg_speed,
        distance_type,
        is_peak_hour
    ]
    
    print(f"📊 Calculated features: {features}", file=sys.stderr)
    return np.array([features])

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        print(f"📥 Received input: {input_data}", file=sys.stderr)
        
        data = json.loads(input_data)
        
        # Validate required fields
        required = [
            "priority_train",
            "affected_train",
            "passengers",
            "distance_km",
            "travel_time_hr",
            "train_capacity",
            "is_peak_hour"
        ]
        
        for field in required:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        # Calculate features
        features = calculate_features(data)
        
        # Make prediction
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities))
        
        print(f"🎯 Prediction: {prediction}, Confidence: {confidence}", file=sys.stderr)
        
        # Map prediction to decision (based on delay_risk from training)
        decision_map = {
            0: "REDUCE_SPEED",      # Low risk - reduce speed slightly
            1: "HOLD_TRAIN",        # High risk - hold the train
        }
        
        decision = decision_map.get(int(prediction), "MANUAL_INTERVENTION")
        
        # Build response
        result = {
            "success": True,
            "decision": decision,
            "priority_train": data["priority_train"],
            "affected_train": data["affected_train"],
            "confidence": round(confidence * 100, 2),
            "reason": "ML-based conflict resolution using historical delay patterns",
            "predicted_delay_risk": int(prediction),
            "all_probabilities": {
                "low_risk": round(float(probabilities[0]) * 100, 2),
                "high_risk": round(float(probabilities[1]) * 100, 2) if len(probabilities) > 1 else 0
            },
            "features_used": {
                "passengers": float(data["passengers"]),
                "distance_km": float(data["distance_km"]),
                "travel_time_hr": float(data["travel_time_hr"]),
                "load_ratio": features[0][3],
                "avg_speed": features[0][4],
                "is_peak_hour": int(data["is_peak_hour"])
            }
        }
        
        # Output JSON result to stdout
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        error_result = {
            "success": False,
            "error": f"Invalid JSON input: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except ValueError as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"Prediction failed: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()