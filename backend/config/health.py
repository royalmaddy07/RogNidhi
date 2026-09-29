from django.http import JsonResponse
from django.views.decorators.http import require_safe


@require_safe
def health_check(request):
    # Liveness only: frequent probes should not keep the Neon compute awake.
    return JsonResponse({'status': 'ok'})
