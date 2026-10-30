# Lab ETST-MR 12A08

Ứng dụng Next.js full-stack dùng Prisma ORM để kết nối PostgreSQL trên Supabase. Không còn Supabase JavaScript SDK hay backend Hugging Face riêng.

## Chạy local

```bash
npm install
npm run dev
```

## Kết nối PostgreSQL Supabase

1. Trong Supabase Dashboard, mở **Project Settings → Database → Connection string**.
2. Mẫu `DATABASE_URL` đã dùng shared transaction pooler IPv4 của dự án, cổng 6543.
3. Mẫu `DIRECT_URL` dùng shared session pooler, cổng 5432, để Prisma chạy migrations.
4. Sao chép `.env.example` thành `.env`, thay `[YOUR-PASSWORD]` trong cả hai URL bằng mật khẩu database (URL-encode các ký tự đặc biệt), rồi chạy `npx prisma migrate deploy`. Prisma CLI đọc `.env`; Next.js cũng tự nạp file này. Lệnh migrate tạo các bảng `events` và `transactions` từ `prisma/migrations/`.

Giữ mật khẩu database trong biến môi trường riêng tư. Không dùng `NEXT_PUBLIC_` cho connection string. Prisma chỉ chạy trong API route handlers phía server.

## Quản lý và quyền truy cập

Đặt `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD` và `ADMIN_SESSION_SECRET` qua biến môi trường. Đặt mật khẩu quản lý và chuỗi session riêng cho từng môi trường; không ghi credentials vào source. File `.env.local` và `.env` bị Git bỏ qua. Điền `DATABASE_URL` và `DIRECT_URL` trong `.env`; không để giá trị trống trong `.env.local` vì file local có độ ưu tiên cao hơn. Cấu hình các biến tương ứng trong Vercel.

Đăng nhập tạo cookie HttpOnly thời hạn 8 giờ. API thu chi và duyệt lịch xác thực cookie phía server. Khách có thể xem lịch đã xác nhận và gửi đăng ký mà không cần tài khoản. Các đăng ký được kiểm tra trùng phòng/giờ trong transaction PostgreSQL trước khi lưu.

## Cấu trúc

- `/` — trang khách: xem lịch đã xác nhận, đăng ký lịch. Không chứa thu chi hay duyệt.
- `/admin/login` — đăng nhập quản lý (rate-limit 5 lần sai / 15 phút).
- `/admin` — tổng quan; `/admin/approvals` — duyệt đăng ký (có lý do từ chối, chặn trùng lịch); `/admin/finance` — thu chi (thêm/sửa/xoá, lọc tháng/loại, xuất CSV).
- Trang admin kiểm tra phiên ở server (`requireAdminPage`) và API kiểm tra lại cookie (`assertAdmin`).
- `lib/` chứa validate (zod), serializer, truy vấn và helper API dùng chung; `components/` chia theo `client`, `admin`, `ui`.

Sau khi cập nhật code cần chạy `npx prisma migrate deploy` (migration `20261031000000_admin_dashboard`).

## Triển khai Vercel thủ công

Import repo vào Vercel và khai báo `DATABASE_URL`, `DIRECT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`. Vercel tự nhận diện Next.js; không cần backend riêng.

Nếu ứng dụng báo thiếu cấu hình sau khi deploy, mở `/api/health` trên đúng domain deployment. `databaseUrlPresent` và `directUrlPresent` phải là `true`; endpoint chỉ trả trạng thái có/không, không trả giá trị bí mật. Nếu là `false`, kiểm tra biến được gán cho đúng project và môi trường (Production hoặc Preview), sau đó tạo deployment mới để biến có hiệu lực.
