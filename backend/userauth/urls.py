from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup),
    path('login/', views.login_user),
    path('logout/', views.logout_user),
    path('me/', views.get_current_user),  # ✅ New endpoint to check session
    # path("search/",views.recommend_property_api)
]
