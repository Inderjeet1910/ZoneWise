# property/urls.py
from django.urls import path
from .views import search_properties,save_property,get_saved_properties,remove_property,predict_residential_price,get_random_properties

urlpatterns = [
    path("api/recommend_properties/", search_properties, name="search_properties"),
    path('api/save-property/',save_property, name='save_property'),
    path("api/saved-properties/", get_saved_properties, name="get_saved_properties"),
    path("api/remove-property/<int:pk>/",remove_property, name="remove_property"),
    path("api/estimate-price/", predict_residential_price, name="estimate_price"),
    path("api/random-properties/", get_random_properties, name="random_properties"),

]

