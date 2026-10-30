#!/usr/bin/env bash
# Tạo biến môi trường trên Vercel nếu chưa có (không ghi đè biến đã tồn tại).
# Cần: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID; giá trị lấy từ biến môi trường cùng tên (GitHub Secrets).
set -euo pipefail

NAMES=(DATABASE_URL DIRECT_URL ADMIN_USERNAME ADMIN_PASSWORD ADMIN_SESSION_SECRET)
VERCEL="npx --yes vercel@latest"

for target in production preview; do
  existing=$($VERCEL env ls "$target" --token "$VERCEL_TOKEN" 2>/dev/null | awk '{print $1}' || true)
  for name in "${NAMES[@]}"; do
    if grep -qx "$name" <<<"$existing"; then
      echo "✓ $name đã có trên Vercel ($target)"
      continue
    fi
    value="${!name:-}"
    if [ -z "$value" ]; then
      echo "::warning::Thiếu $name trên Vercel ($target) và không có GitHub Secret cùng tên để tạo."
      continue
    fi
    echo "+ Tạo $name ($target)"
    # Preview cần chỉ định nhánh; để trống = mọi nhánh preview. Lỗi ở preview không chặn deploy production.
    if [ "$target" = preview ]; then
      printf %s "$value" | $VERCEL env add "$name" preview "" --token "$VERCEL_TOKEN" >/dev/null || echo "::warning::Không tạo được $name cho preview"
    else
      printf %s "$value" | $VERCEL env add "$name" production --token "$VERCEL_TOKEN" >/dev/null
    fi
  done
done
