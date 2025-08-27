from django.db import models

# Create your models here.
from django.db import models
from userauth.models import Customer  # link to your user model

class ListingProperty(models.Model):
    LISTING_TYPES = (
        ("Sell", "Sell"),
        ("Rent", "Rent"),
    )
    CATEGORY_CHOICES = (
        ("Residential", "Residential"),
        ("Commercial", "Commercial"),
    )

    user = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="listings")
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    property_type = models.CharField(max_length=100)
    bedrooms = models.IntegerField(blank=True, null=True)   # Only for Residential
    bathrooms = models.IntegerField(blank=True, null=True)  # Only for Residential
    area = models.IntegerField()   # sqft
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    image = models.URLField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.listing_type} {self.property_type} in {self.city}"
