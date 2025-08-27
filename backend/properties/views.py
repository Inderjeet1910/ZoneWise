import os
import joblib
import pandas as pd
import numpy as np
from django.http import JsonResponse
from rest_framework.decorators import api_view

# -------------------------------
# Paths
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "properties", "data", "residential_data.csv")
KNN_FILE = os.path.join(BASE_DIR, "properties", "ml", "knn_model.pkl")
REG_FILE = os.path.join(BASE_DIR, "properties", "ml", "regression_model.pkl")
OHE_FILE = os.path.join(BASE_DIR, "properties", "ml", "ohe_encoder.pkl")
SCALER_FILE = os.path.join(BASE_DIR, "properties", "ml", "scaler.pkl")
KNN_OHE_FILE = os.path.join(BASE_DIR, "properties", "ml", "ohe_encoder_knn.pkl")
KNN_SCALER_FILE = os.path.join(BASE_DIR, "properties", "ml", "scaler_knn.pkl")
AMENITIES_FILE = os.path.join(BASE_DIR, "properties", "ml", "amenities_encoder.pkl")

# -------------------------------
# Load Data & Models
# -------------------------------
try:
    df = pd.read_csv(DATA_FILE)

    # Normalize city and create numeric price
    df["_city_norm"] = df["city"].astype(str).str.strip().str.casefold()
    price_clean = (
        df["price"]
        .astype(str)
        .str.replace(",", "", regex=True)
        .str.replace("₹", "", regex=True)
        .str.strip()
        .str.extract(r"([\d.]+)", expand=False)
    )
    df["_price_num"] = pd.to_numeric(price_clean, errors="coerce")

    # Load ML objects
    knn_model = joblib.load(KNN_FILE)
    reg_model = joblib.load(REG_FILE)
    ohe_reg = joblib.load(OHE_FILE)
    scaler_reg = joblib.load(SCALER_FILE)
    ohe_knn = joblib.load(KNN_OHE_FILE)
    scaler_knn = joblib.load(KNN_SCALER_FILE)
    amenities_encoder = joblib.load(AMENITIES_FILE)
except Exception as e:
    raise Exception(f"Failed to load data or models: {str(e)}")


# -------------------------------
# Search + Recommendation Endpoint
# -------------------------------
@api_view(["POST"])
def search_properties(request):
    try:
        data = request.data or {}

        # -------------------------------
        # Required inputs
        # -------------------------------
        city = data.get("city")
        location = data.get("location")
        property_type = data.get("property_type")
        bedrooms = data.get("bedrooms")
        area_sqft = data.get("area_sqft")
        amenities = data.get("amenities", "")

        # -------------------------------
        # Budget clean
        # -------------------------------
        raw_budget = data.get("max_price")
        max_budget = None
        if raw_budget is not None and str(raw_budget).strip() != "":
            rb = (
                str(raw_budget)
                .replace(",", "")
                .replace("₹", "")
                .strip()
            )
            max_budget = pd.to_numeric(rb, errors="coerce")
            if pd.isna(max_budget):
                return JsonResponse({"error": "Invalid max_budget value"}, status=400)

        if not all([city, location, property_type, bedrooms, area_sqft]):
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            bedrooms = float(bedrooms)
            area_sqft = float(area_sqft)
        except ValueError:
            return JsonResponse({"error": "Invalid numeric values for bedrooms/area_sqft"}, status=400)

        amenities_list = [a.strip() for a in str(amenities).split(",") if a.strip()]

        # -------------------------------
        # Regression prediction - FIXED: Now includes property_type
        # -------------------------------
        cat_features_reg = [[city, location, property_type]]  # Added property_type
        cat_encoded_reg = ohe_reg.transform(cat_features_reg)
        num_features_reg = np.array([[bedrooms, area_sqft]], dtype=float)
        num_scaled_reg = scaler_reg.transform(num_features_reg)
        X_reg = np.hstack([cat_encoded_reg, num_scaled_reg])

        try:
            regression_price = float(reg_model.predict(X_reg)[0])
        except Exception as e:
            return JsonResponse({"error": f"Regression inference failed: {str(e)}"}, status=500)

        # -------------------------------
        # Exact-match retrieval
        # -------------------------------
        try:
            city_norm = str(city).strip().casefold()
            loc_norm = str(location).strip().casefold()
            pt_norm = str(property_type).strip().casefold()

            df_exact = df.copy()
            df_exact = df_exact[df_exact["city"].astype(str).str.strip().str.casefold() == city_norm]
            df_exact = df_exact[df_exact["location"].astype(str).str.strip().str.casefold() == loc_norm]
            df_exact = df_exact[df_exact["property_type"].astype(str).str.strip().str.casefold() == pt_norm]

            beds_series = pd.to_numeric(df_exact.get("bedrooms"), errors="coerce")
            beds_target = float(bedrooms)
            df_exact = df_exact[beds_series == beds_target]

            if not df_exact.empty:
                # Numeric price
                df_exact["_price_num"] = (
                    df_exact["price"].astype(str).str.replace(",", "").str.replace("₹", "").str.strip()
                )
                df_exact["_price_num"] = pd.to_numeric(df_exact["_price_num"], errors="coerce")

                target_price = float(max_budget) if max_budget is not None else float(regression_price)
                df_exact["_price_dist"] = (df_exact["_price_num"] - target_price).abs()

                # Area proximity
                area_series = pd.to_numeric(df_exact.get("area_sqft"), errors="coerce")
                try:
                    area_target = float(area_sqft)
                    df_exact["_area_dist"] = (area_series - area_target).abs()
                except Exception:
                    df_exact["_area_dist"] = np.nan

                df_exact = df_exact.sort_values(by=["_price_dist", "_area_dist"], na_position="last")
                top_df = df_exact.head(10).copy()

                def _to_int_local(x, default=0):
                    try:
                        return int(float(x))
                    except Exception:
                        return default

                out_exact = []
                for _, row in top_df.iterrows():
                    rec = row.to_dict()
                    rec["bedrooms"] = _to_int_local(rec.get("bedrooms", 0))
                    rec["area_sqft"] = _to_int_local(rec.get("area_sqft", 0))
                    pn = row.get("_price_num", np.nan)
                    rec["price"] = float(pn) if pd.notna(pn) and np.isfinite(pn) else None
                    img = rec.get("image")
                    if pd.isna(img) or img == "":
                        rec["image"] = None
                    # Drop helper cols
                    rec.pop("_price_num", None)
                    rec.pop("_price_dist", None)
                    rec.pop("_area_dist", None)
                    out_exact.append(rec)

                if out_exact:
                    return JsonResponse({
                        "regression_price": regression_price,
                        "recommendations": out_exact,
                    })
        except Exception:
            pass  # fallback to KNN

        # -------------------------------
        # Prefilter by city + budget
        # -------------------------------
        city_norm = str(city).strip().casefold()
        df_city = df[df["city"].astype(str).str.strip().str.casefold() == city_norm].copy()

        df_city["_price_num"] = (
            df_city["price"]
            .astype(str)
            .str.replace(",", "")
            .str.replace("₹", "")
            .str.strip()
        )
        df_city["_price_num"] = pd.to_numeric(df_city["_price_num"], errors="coerce")

        min_budget, budget_limit = None, None
        if max_budget is not None:
            budget_limit = float(max_budget) * 1.02
            min_budget = float(max_budget) * 0.90
            df_city = df_city[pd.notna(df_city["_price_num"])]
            df_city = df_city[(df_city["_price_num"] >= min_budget) & (df_city["_price_num"] <= budget_limit)]

        if df_city.empty:
            return JsonResponse({"regression_price": regression_price, "recommendations": []})

        # -------------------------------
        # KNN Input
        # -------------------------------
        cat_features_knn = [[city, location, property_type]]
        cat_encoded_knn = ohe_knn.transform(cat_features_knn)

        budget_for_knn = regression_price
        if max_budget is not None:
            budget_for_knn = float(max_budget)

        num_features_knn = np.array([[bedrooms, area_sqft, budget_for_knn]], dtype=float)
        num_scaled_knn = scaler_knn.transform(num_features_knn)
        amenities_encoded = amenities_encoder.transform([amenities_list])
        X_knn = np.hstack([cat_encoded_knn, num_scaled_knn, amenities_encoded])

        try:
            distances, indices = knn_model.kneighbors(X_knn, n_neighbors=min(800, len(df)))
        except Exception as e:
            return JsonResponse({"error": f"KNN inference failed: {str(e)}"}, status=500)

        allowed_idx = set(df_city.index.tolist())
        candidate_idx = [int(i) for i in indices[0] if int(i) in allowed_idx]

        if candidate_idx:
            recommended_df = df.loc[candidate_idx].copy()

            # Budget safeguard
            if max_budget is not None:
                recommended_df["_price_num"] = (
                    recommended_df["price"]
                    .astype(str)
                    .str.replace(",", "")
                    .str.replace("₹", "")
                    .str.strip()
                )
                recommended_df["_price_num"] = pd.to_numeric(recommended_df["_price_num"], errors="coerce")
                recommended_df = recommended_df[
                    (recommended_df["_price_num"] >= min_budget) &
                    (recommended_df["_price_num"] <= budget_limit)
                ]

            recommended_df = recommended_df.head(200)

            # User filters
            filtered_df = recommended_df.copy()

            if location:
                loc_norm = str(location).strip().casefold()
                filtered_df = filtered_df[
                    filtered_df["location"].astype(str).str.strip().str.casefold() == loc_norm
                ]

            if property_type:
                pt_norm = str(property_type).strip().casefold()
                filtered_df = filtered_df[
                    filtered_df["property_type"].astype(str).str.strip().str.casefold() == pt_norm
                ]

            if bedrooms is not None and bedrooms != "":
                try:
                    bed_num = float(bedrooms)
                    tmp = pd.to_numeric(filtered_df["bedrooms"], errors="coerce")
                    filtered_df = filtered_df[tmp == bed_num]
                except Exception:
                    pass

            if not filtered_df.empty:
                recommended_df = filtered_df
        else:
            recommended_df = pd.DataFrame()

        # -------------------------------
        # Prepare Output
        # -------------------------------
        def _to_int(x, default=0):
            try:
                return int(float(x))
            except Exception:
                return default

        out = []
        for _, row in recommended_df.iterrows():
            rec = row.to_dict()
            rec["bedrooms"] = _to_int(rec.get("bedrooms", 0))
            rec["area_sqft"] = _to_int(rec.get("area_sqft", 0))

            pn = row.get("_price_num", np.nan)
            rec["price"] = float(pn) if pd.notna(pn) and np.isfinite(pn) else None

            img = rec.get("image")
            if pd.isna(img) or img == "":
                rec["image"] = None

            rec.pop("_price_num", None)
            out.append(rec)

        return JsonResponse({"regression_price": regression_price, "recommendations": out})

    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


import pandas as pd
import numpy as np
from django.http import JsonResponse
from rest_framework.decorators import api_view
import os

# Path to your CSV file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, "properties", "data", "residential_data.csv")

# Load dataset once
try:
    df = pd.read_csv(DATA_FILE)
except Exception as e:
    raise Exception(f"Failed to load properties data: {str(e)}")


@api_view(["GET"])
def get_random_properties(request):
    """
    Return 3 random properties with all details from CSV.
    """
    try:
        # Pick 3 random rows
        sample_df = df.sample(n=3, replace=False)

        # Convert rows to list of dicts
        properties = sample_df.to_dict(orient="records")

        # Ensure correct types (like int for bedrooms, area)
        for p in properties:
            p["bedrooms"] = int(p.get("bedrooms", 0)) if pd.notna(p.get("bedrooms")) else None
            p["area_sqft"] = int(p.get("area_sqft", 0)) if pd.notna(p.get("area_sqft")) else None
            p["price"] = float(str(p.get("price", "")).replace(",", "").replace("₹", "").strip()) \
                         if pd.notna(p.get("price")) else None
            # Empty image handling
            if not p.get("image") or pd.isna(p["image"]):
                p["image"] = None

        return JsonResponse({"properties": properties}, safe=False)

    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ResidentialProperty
from .serializers import ResidentialPropertySerializer
from userauth.models import Customer

@api_view(['POST'])
def save_property(request):
    try:
        # get current user
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = Customer.objects.get(id=user_id)

        data = request.data.copy()
        property_instance = ResidentialProperty.objects.create(
            user=user,
            city=data.get("city"),
            location=data.get("location"),
            property_type=data.get("property_type"),
            bedrooms=int(data.get("bedrooms")),
            area_sqft=int(data.get("area_sqft")),
            seller_name=data.get("seller_name"),
            seller_phone=data.get("seller_phone"),
            property_image=data.get("property_image"),
            price=float(data.get("price", 0)),
            Connectivity=float(data.get("Connectivity", 0)),
            Neighbourhood=float(data.get("Neighbourhood", 0)),
            Safety=float(data.get("Safety", 0)),
            Livability=float(data.get("Livability", 0)),
        )
        serializer = ResidentialPropertySerializer(property_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def get_saved_properties(request):
    try:
        # Get current user
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        user = Customer.objects.get(id=user_id)

        # Get all saved properties for this user
        saved_properties = ResidentialProperty.objects.filter(user=user)
        serializer = ResidentialPropertySerializer(saved_properties, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Customer.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
def remove_property(request, pk):
    try:
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        property_instance = ResidentialProperty.objects.filter(id=pk, user_id=user_id).first()
        if not property_instance:
            return Response({"error": "Property not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        property_instance.delete()
        return Response({"message": "Property removed successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
  

import os
import json
import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings


def preprocess_amenities_input(df, model):
    """
    Expand amenities column into multiple binary columns
    and align with model training features.
    """
    if "amenities" in df.columns:
        amenities_expanded = df["amenities"].fillna("").str.get_dummies(sep=",")
        df = pd.concat([df.drop(columns=["amenities"]), amenities_expanded], axis=1)

    # Align with model training features
    expected_features = model.feature_names_in_
    for col in expected_features:
        if col not in df.columns:
            df[col] = 0
    df = df[expected_features]  # keep order same

    return df


@csrf_exempt
def predict_residential_price(request):
    if request.method == 'POST':
        try:
            data = request.POST if request.POST else json.loads(request.body.decode('utf-8'))

            required_fields = ['listing_type', 'city', 'location', 'property_type', 'bedrooms', 'area_sqft', 'amenities']
            for field in required_fields:
                if field not in data or not data[field]:
                    return JsonResponse({'error': f'Missing or empty required field: {field}'}, status=400)

            listing_type = data.get('listing_type').lower().strip()
            city = data.get('city')
            location = data.get('location')
            property_type = data.get('property_type')
            bedrooms = float(data.get('bedrooms', 0)) if data.get('bedrooms') else 0
            area_sqft = float(data.get('area_sqft'))
            amenities = data.get('amenities')

            if area_sqft <= 0:
                return JsonResponse({'error': 'Area must be greater than 0'}, status=400)

            input_data = pd.DataFrame({
                'city': [city],
                'location': [location],
                'property_type': [property_type],
                'bedrooms': [bedrooms],
                'area_sqft': [area_sqft],
                'amenities': [amenities]
            })

            if listing_type == "sale":
                model_path = os.path.join(settings.BASE_DIR, 'properties', 'ml', 'residential_sales_model.pkl')
                price_basis = "Total (Sale)"
            elif listing_type == "rent":
                model_path = os.path.join(settings.BASE_DIR, 'properties', 'ml', 'residential_rents_model.pkl')
                price_basis = "Total (Monthly Rent)"
            else:
                return JsonResponse({'error': 'Invalid listing_type. Must be "sale" or "rent".'}, status=400)

            if not os.path.exists(model_path):
                return JsonResponse({'error': f'Model file not found at {model_path}. Please train the model first.'}, status=500)

            model = joblib.load(model_path)

            # 🔹 Preprocess amenities & align features
            input_data = preprocess_amenities_input(input_data, model)

            # 🔹 Predict TOTAL price (model was trained on total price, not per sqft)
            estimated_price = model.predict(input_data)[0]

            return JsonResponse({
                'estimated_price': round(float(estimated_price), 2),
                'price_basis': price_basis
            })

        except ValueError as e:
            return JsonResponse({'error': f'Invalid numeric value: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Internal server error: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
