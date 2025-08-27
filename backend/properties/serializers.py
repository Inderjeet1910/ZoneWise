from rest_framework import serializers
from .models import ResidentialProperty

class ResidentialPropertySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ResidentialProperty
        fields = [
            "id", "user_name", "user_email", "city", "location",
            "property_type", "bedrooms", "area_sqft", "seller_name",
            "seller_phone", "property_image","price","Connectivity","Neighbourhood","Safety","Livability", "created_at"
        ]
