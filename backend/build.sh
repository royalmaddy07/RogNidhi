#!/usr/bin/env bash
# Run from the repository root with: bash backend/build.sh
set -euo pipefail
cd "$(dirname "$0")"

# Render has no GPU. Avoid downloading CUDA dependencies for embeddings.
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r requirements.txt

python manage.py check
python manage.py collectstatic --no-input

# Kept in the build for compatibility with Render's Free plan.
python manage.py migrate --no-input
