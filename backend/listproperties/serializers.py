from rest_framework import serializers
from .models import ListingProperty

class ListingPropertySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ListingProperty
        fields = [
            "id", "user_name", "user_email", "listing_type", "category", "city",
            "location", "property_type", "bedrooms", "bathrooms", "area",
            "price", "image", "description", "phone_number", "created_at"
        ]
