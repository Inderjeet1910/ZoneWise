from django.shortcuts import render

# Create your views here.
from rest_framework.response import Response
from rest_framework import status
from .models import ListingProperty
from .serializers import ListingPropertySerializer
from userauth.models import Customer
from rest_framework.decorators import api_view
# ---------------- Add new property ----------------
@api_view(['POST'])
def save_listing_property(request):
    try:
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        user = Customer.objects.get(id=user_id)
        data = request.data.copy()

        listing = ListingProperty.objects.create(
            user=user,
            listing_type=data.get("listing_type"),
            category=data.get("category"),
            city=data.get("city"),
            location=data.get("location"),
            property_type=data.get("property_type"),
            bedrooms=int(data.get("bedrooms")) if data.get("bedrooms") else None,
            bathrooms=int(data.get("bathrooms")) if data.get("bathrooms") else None,
            area=int(data.get("area", 0)),
            price=float(data.get("price", 0)),
            image=data.get("image"),
            description=data.get("description"),
            phone_number=data.get("phone_number"),
        )

        serializer = ListingPropertySerializer(listing)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Get all properties of user ----------------
@api_view(['GET'])
def get_user_listings(request):
    try:
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        user = Customer.objects.get(id=user_id)
        listings = ListingProperty.objects.filter(user=user)
        serializer = ListingPropertySerializer(listings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------- Delete property ----------------
@api_view(['DELETE'])
def delete_listing_property(request, pk):
    try:
        user_id = request.session.get("user_id")
        if not user_id:
            return Response({"error": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

        listing = ListingProperty.objects.filter(id=pk, user_id=user_id).first()
        if not listing:
            return Response({"error": "Property not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        listing.delete()
        return Response({"message": "Property deleted successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




import os
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Get the directory where this file (views.py) is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build the full path to city_data.csv
CSV_PATH = os.path.join(BASE_DIR, "city_data.csv")

# Load dataset
df = pd.read_csv(CSV_PATH)

def get_city_data(city):
    row = df[df["City"].str.lower() == city.lower()]
    if row.empty:
        return None
    return row.iloc[0].to_dict()

# Precompute min/max for normalization across dataset
METRIC_CONFIG = {
    "Housing_Cost_per_sqft": {"label": "Housing Affordability", "higher_better": False},
    "Job_Market_Score": {"label": "Job Market", "higher_better": True},
    "Cost_of_Living_Index": {"label": "Cost of Living", "higher_better": False},
    "Amenities_Score": {"label": "Amenities", "higher_better": True},
    "Lifestyle_Score": {"label": "Lifestyle", "higher_better": True},
}

MIN_MAX = {}
for col in METRIC_CONFIG.keys():
    # Guard against missing columns
    if col in df.columns:
        col_min = pd.to_numeric(df[col], errors='coerce').min()
        col_max = pd.to_numeric(df[col], errors='coerce').max()
        MIN_MAX[col] = (float(col_min), float(col_max))

def normalize_score(value, col):
    if value is None:
        return None
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    if col not in MIN_MAX:
        return None
    mn, mx = MIN_MAX[col]
    if mx is None or mn is None or mx == mn:
        return None
    cfg = METRIC_CONFIG[col]
    # Scale 0-100, with higher_better deciding direction
    if cfg["higher_better"]:
        pct = (v - mn) / (mx - mn)
    else:
        pct = (mx - v) / (mx - mn)
    pct = max(0.0, min(1.0, pct))
    return round(pct * 100.0, 2)

@csrf_exempt
def move_meter_view(request):
    from_city = request.GET.get("from_city")
    to_city = request.GET.get("to_city")

    if not from_city or not to_city:
        return JsonResponse({"error": "Please provide from_city and to_city"}, status=400)

    from_data = get_city_data(from_city)
    to_data = get_city_data(to_city)

    if not from_data or not to_data:
        return JsonResponse({"error": "One or both cities not found"}, status=404)

    # Build normalized comparison metrics
    metrics = []
    from_scores = []
    to_scores = []
    for col, cfg in METRIC_CONFIG.items():
        from_val = from_data.get(col)
        to_val = to_data.get(col)
        from_score = normalize_score(from_val, col)
        to_score = normalize_score(to_val, col)
        if from_score is not None:
            from_scores.append(from_score)
        if to_score is not None:
            to_scores.append(to_score)
        metrics.append({
            "key": col,
            "label": cfg["label"],
            "from_value": from_val,
            "to_value": to_val,
            "from_score": from_score,
            "to_score": to_score,
            "higher_better": cfg["higher_better"],
        })

    summary = None
    if from_scores and to_scores:
        from_overall = round(sum(from_scores) / len(from_scores), 2)
        to_overall = round(sum(to_scores) / len(to_scores), 2)
        summary = {
            "from_overall": from_overall,
            "to_overall": to_overall,
            "winner": "from" if from_overall > to_overall else ("to" if to_overall > from_overall else "tie"),
        }

    return JsonResponse({
        "from_city": from_data,
        "to_city": to_data,
        "metrics": metrics,
        "summary": summary,
    })

# views.py (assuming this is in a Django app, e.g., api/views.py)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .recommendation import get_recommendations  # Import from recommendation.py

@api_view(["POST"])
def recommend_property(request):
    user_input = request.data
    results = get_recommendations(user_input, top_n=10)
    return Response(results)