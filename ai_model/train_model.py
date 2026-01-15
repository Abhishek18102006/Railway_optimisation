import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ==============================
# PATHS
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "ml_training_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# ==============================
# LOAD DATA
# ==============================
df = pd.read_csv(CSV_PATH)

# ==============================
# FEATURE ENGINEERING
# ==============================
df["load_ratio"] = df["passengers"] / df["train_capacity"]
df["avg_speed"] = df["distance_km"] / df["travel_time_hr"]

def distance_type(d):
    if d < 150:
        return 0
    elif d < 400:
        return 1
    else:
        return 2

df["distance_type"] = df["distance_km"].apply(distance_type)

# ==============================
# FEATURES & TARGET
# ==============================
X = df[
    [
        "passengers",
        "distance_km",
        "travel_time_hr",
        "load_ratio",
        "avg_speed",
        "distance_type",
        "is_peak_hour"
    ]
]

y = df["delay_risk"]

# ==============================
# TRAIN / TEST SPLIT
# ==============================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ==============================
# MODEL
# ==============================
model = RandomForestClassifier(
    n_estimators=120,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# ==============================
# EVALUATION
# ==============================
y_pred = model.predict(X_test)

print("\nModel Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# ==============================
# SAVE MODEL
# ==============================
joblib.dump(model, MODEL_PATH)
print(f"\n✅ Model trained and saved as {MODEL_PATH}")
