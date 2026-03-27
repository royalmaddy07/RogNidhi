import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.test import Client
from api.models import PatientProfile
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
import re
import traceback

p = PatientProfile.objects.first()
if not p:
    print("No patient found")
    sys.exit(1)
user = p.user

token = str(RefreshToken.for_user(user).access_token)
client = Client(SERVER_NAME='127.0.0.1')
with open('../image.png', 'rb') as f:
    file = SimpleUploadedFile('test.png', f.read(), content_type='image/png')

try:
    response = client.post('/api/documents/upload/', 
                           {'title': 'Test doc', 'document_type': 'other', 'file': file}, 
                           HTTP_AUTHORIZATION=f'Bearer {token}')

    print('STATUS', response.status_code)
    if response.status_code == 500:
        html = response.content.decode('utf-8', errors='ignore')
        match = re.search(r'<pre class="exception_value">(.*?)</pre>', html, re.DOTALL)
        print('EXCEPTION:', match.group(1).strip() if match else html[:500])
    else:
        print('CONTENT', response.content)
except Exception as e:
    traceback.print_exc()
