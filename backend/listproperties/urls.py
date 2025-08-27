from django.urls import path
from .views import save_listing_property, get_user_listings, delete_listing_property,recommend_property,move_meter_view

urlpatterns = [
    path("api/properties_listings/", save_listing_property, name="save_listing_property"),
    path("api/properties_listings_get/", get_user_listings, name="get_user_listings"),
    path("api/properties_listings/<int:pk>/", delete_listing_property, name="delete_listing_property"),
    path("api/move-meter/",move_meter_view, name="move_meter"),
    path("api/recommend/",recommend_property, name="recommend_properties"),

]
