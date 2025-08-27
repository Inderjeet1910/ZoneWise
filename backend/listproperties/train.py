# train.py
# This file trains the model and saves the fitted encoders and KNN to pickle files for later use in the API.

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler, MultiLabelBinarizer
from sklearn.neighbors import NearestNeighbors

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "rents.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load and preprocess data
df = pd.read_csv(DATA_PATH)

# Rename columns to match expected capitalized keys from frontend
df = df.rename(columns={
    'city': 'City',
    'location': 'Location',
    'property_type': 'Property Type',
    'bedrooms': 'Bedrooms',
    'area_sqft': 'Area (sqft)',
    'price': 'Price (INR)',
    'amenities': 'amenities'
})

# Process amenities
df["amenities_list"] = df["amenities"].fillna("").apply(
    lambda x: [a.strip() for a in str(x).split(",") if a.strip()]
)

# Define feature columns based on available data
cat_cols = ["City", "Location", "Property Type"]
num_cols = ["Bedrooms", "Area (sqft)", "Price (INR)"]

# Fit encoders and scaler
ohe = OneHotEncoder(handle_unknown="ignore")
mlb = MultiLabelBinarizer()
scaler = StandardScaler()

cat_encoded = ohe.fit_transform(df[cat_cols]).toarray()
amenities_encoded = mlb.fit_transform(df["amenities_list"])
num_scaled = scaler.fit_transform(df[num_cols].fillna(0))

X = np.hstack([cat_encoded, amenities_encoded, num_scaled])

# Fit KNN
knn = NearestNeighbors(n_neighbors=20, metric="euclidean")
knn.fit(X)

# Save the fitted models and encoders
with open(os.path.join(MODEL_DIR, 'ohe.pkl'), 'wb') as f:
    pickle.dump(ohe, f)
with open(os.path.join(MODEL_DIR, 'mlb.pkl'), 'wb') as f:
    pickle.dump(mlb, f)
with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)
with open(os.path.join(MODEL_DIR, 'knn.pkl'), 'wb') as f:
    pickle.dump(knn, f)
with open(os.path.join(MODEL_DIR, 'df.pkl'), 'wb') as f:
    pickle.dump(df, f)  # Save dataframe for retrieving results

print("Training complete. Models saved to models/ directory.")