from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Customer
import json

from django.contrib.auth.hashers import make_password, check_password

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if Customer.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already registered'}, status=400)

            # Create customer with hashed password
            customer = Customer(username=username, email=email)
            customer.set_password(password)  # Hash password
            customer.save()

            request.session['user_id'] = customer.id
            return JsonResponse({'message': 'Signup successful', 'user': {
                'username': customer.username,
                'email': customer.email
            }})
        except Exception as e:
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=400)

            user = Customer.objects.get(email=email)
            
            # Verify hashed password
            if user.check_password(password):
                request.session['user_id'] = user.id
                return JsonResponse({
                    "message": "Login successful",
                    "user": {"username": user.username, "email": user.email}
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)

        except Customer.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)  # Generic error
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def logout_user(request):
    if request.session.get('user_id'):
        request.session.flush()
        return JsonResponse({"message": "Logged out successfully"})
    else:
        return JsonResponse({"message": "No user is logged in"}, status=400)


def get_logged_in_user(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            user = Customer.objects.get(id=user_id)
            return JsonResponse({
                'isAuthenticated': True,
                'user': {
                    'username': user.username,
                    'email': user.email
                }
            })
        except Customer.DoesNotExist:
            return JsonResponse({'isAuthenticated': False}, status=404)
    else:
        return JsonResponse({'isAuthenticated': False}, status=200)


from django.views.decorators.http import require_GET

@csrf_exempt
@require_GET
def get_current_user(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    try:
        user = Customer.objects.get(id=user_id)
        return JsonResponse({
            'username': user.username,
            'email': user.email
        })
    except Customer.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)



