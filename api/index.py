import os
import sys

# Ensure root directory is in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# ==============================================================================
# USER STORY 03 (US-03): Vercel Serverless WSGI Entrypoint Handler
# Chịu trách nhiệm khởi tạo WSGI Application tiếp nhận mọi HTTP Request 
# gửi tới `/api/v1/ai/standardize/` trên môi trường Vercel Cloud Serverless.
# ==============================================================================

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()

# Alias handler cho Vercel Serverless Function
handler = app

