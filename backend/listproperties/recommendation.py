# recommendation.py
# This file contains the get_recommendations function, loading the pre-trained models.

import os
import pickle
import numpy as np

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

def get_recommendations(user_input, top_n=10):
    # Load pre-fitted models and encoders
    with open(os.path.join(MODEL_DIR, 'ohe.pkl'), 'rb') as f:
        ohe = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'mlb.pkl'), 'rb') as f:
        mlb = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'knn.pkl'), 'rb') as f:
        knn = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'df.pkl'), 'rb') as f:
        df = pickle.load(f)

    # Define columns (matching train.py)
    cat_cols = ["City", "Location", "Property Type"]
    num_cols = ["Bedrooms", "Area (sqft)", "Price (INR)"]

    # Prepare user input
    cat_input = [[user_input.get(c, "") for c in cat_cols]]
    cat_vec = ohe.transform(cat_input).toarray()

    amenities_input = user_input.get("amenities", [])
    if isinstance(amenities_input, str):
        amenities_input = [a.strip() for a in amenities_input.split(",") if a.strip()]
    elif not isinstance(amenities_input, list):
        amenities_input = []
    amenities_vec = mlb.transform([amenities_input])

    num_input = np.array([[user_input.get(c, 0) for c in num_cols]], dtype=float)
    num_vec = scaler.transform(num_input)

    X_user = np.hstack([cat_vec, amenities_vec, num_vec])

    n_neighbors = min(top_n, len(df))
    distances, indices = knn.kneighbors(X_user, n_neighbors=n_neighbors)

    results = df.iloc[indices[0]].copy()
    results["similarity_score"] = 1 / (1 + distances[0])
    results = results.replace({np.nan: None})

    return results.to_dict(orient="records")