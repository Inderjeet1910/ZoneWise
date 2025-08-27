from django.db import models
from userauth.models import Customer  # import your user model

class ResidentialProperty(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="saved_properties")
    city = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    property_type = models.CharField(max_length=100)
    bedrooms = models.IntegerField()
    area_sqft = models.IntegerField()
    seller_name = models.CharField(max_length=200)
    seller_phone = models.CharField(max_length=20)
    property_image = models.URLField(max_length=500, blank=True, null=True)
    price = models.DecimalField(default=0,max_digits=10, decimal_places=2)
    Connectivity= models.DecimalField(default=0,decimal_places=2,max_digits=5)
    Neighbourhood = models.DecimalField(default=0,decimal_places=2,max_digits=5)
    Safety = models.DecimalField(default=0,decimal_places=2,max_digits=5)
    Livability = models.DecimalField(default=0,decimal_places=2,max_digits=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.property_type} in {self.city}"

