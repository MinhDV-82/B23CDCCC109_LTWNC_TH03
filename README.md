# Class Deadline Hub - Cổng Quản Lý Deadline Lớp Học (PTIT)

Cổng thông tin quản lý thời hạn học tập, bài tập lớn, thực hành lab và đồ án chuyên ngành dành riêng cho sinh viên Học viện Công nghệ Bưu chính Viễn thông (PTIT). Dự án được xây dựng với kiến trúc **Next.js 14 App Router**, **TypeScript (Strict Mode)**, **React Server Components**, **Ant Design**, **NextAuth.js (Auth.js)**, tuân thủ nghiêm ngặt các tiêu chuẩn về **Rendering**, **Routing**, **Authentication**, **Middleware**, **Authorization (RBAC)**, **SEO** và **Web Performance**.

---

## 1. Giới thiệu Class Deadline Hub
Class Deadline Hub giải quyết bài toán theo dõi tiến độ học tập cho tập thể sinh viên:
- **Người dùng chưa đăng nhập (Khách / Guest)**: Xem toàn bộ deadline công khai, tra cứu theo môn học, xem chi tiết, sao chép liên kết chia sẻ, nhận diện thẻ xem trước Open Graph và dữ liệu có cấu trúc BreadcrumbList JSON-LD.
- **Sinh viên đăng nhập (Student / User)**: Có dashboard cá nhân, đánh dấu bài tập đã hoàn thành, theo dõi số ngày còn lại hoặc số ngày quá hạn, lọc theo môn học và xem thống kê tiến độ học tập thực tế.
- **Lớp trưởng (Admin)**: Toàn quyền truy cập bảng quản trị `/admin`, thêm deadline mới, xóa deadline với modal xác nhận an toàn, kích hoạt cơ chế xóa cache và làm mới dữ liệu tự động (On-demand Cache Invalidation).

---

## 2. Danh sách chức năng
1. **Trang chủ (`/`)**: Landing page Modern Academic Dashboard, hiển thị thống kê tự động từ dữ liệu JSON (tổng deadline, sắp đến hạn trong 7 ngày, số môn học), các deadline nổi bật, thẻ 4 môn học chuyên ngành và liên kết chuyển trang mượt mà.
2. **Chi tiết môn học (`/subjects/[slug]`)**: Thông tin môn học, mã học phần, số tín chỉ, giảng viên phụ trách và danh sách deadline riêng của môn học đó.
3. **Danh sách Deadline (`/deadlines`)**: Bộ lọc Client Component tìm kiếm theo từ khóa, lọc theo môn học, lọc trạng thái (sắp đến hạn, còn nhiều thời gian, đã quá hạn) và phân trang.
4. **Chi tiết Deadline (`/deadlines/[id]`)**: Hiển thị đầy đủ mô tả yêu cầu bài tập, ngày thông báo, hạn chót, đồng hồ đếm ngược `DeadlineCountdown`, nút đánh dấu hoàn thành cho sinh viên và nút sao chép link chia sẻ. Báo lỗi `notFound()` khi ID không tồn tại.
5. **Đăng nhập (`/login`)**: Biểu mẫu Ant Design Form kiểm tra hợp lệ, hiển thị thông báo lỗi, chuyển hướng về đúng `callbackUrl` sau khi đăng nhập thành công và phòng chống lỗ hổng Open Redirect.
6. **Bảng điều khiển cá nhân (`/dashboard`)**: Nested Layout với sidebar menu làm nổi bật route hiện tại (`/dashboard`, `/dashboard/completed`, `/dashboard/pending`), thống kê tiến độ cá nhân, cảnh báo deadline khẩn cấp, switch toggle trạng thái hoàn thành trực tiếp trên bảng.
7. **Trang quản trị (`/admin`)**: Dành riêng cho tài khoản Admin, cung cấp giao diện quản lý danh sách, form tạo deadline mới (server-generated ID an toàn), xóa deadline có modal xác nhận.
8. **Kiểm tra quyền tập trung (Single Source of Truth)**: Toàn bộ kiểm tra phân quyền quy về một hàm `can(role, action): boolean` tại `lib/permissions.ts`. Mọi Server Action đều tự kiểm tra session và quyền độc lập phía máy chủ.

---

## 3. Công nghệ sử dụng
- **Core Framework**: Next.js 14.2.35 (App Router, React Server Components).
- **Ngôn ngữ**: TypeScript 5.7+ (Strict Mode).
- **UI & Thiết kế**: Ant Design 5.24+, `@ant-design/icons`, `@ant-design/nextjs-registry`, CSS Modules, CSS Variables.
- **Bảng màu**: Modern Academic Dashboard:
  - Background chính: `#FFFFFF`
  - Background phụ: `#F7F9FC`
  - Primary: `#4169E1` | Primary Hover: `#3158CC`
  - Text chính: `#1F2937` | Text phụ: `#64748B`
  - Border: `#E5E7EB` | Success: `#16A34A` | Warning: `#D97706` | Error: `#DC2626`
- **Xác thực**: NextAuth.js v4 với Credentials Provider, JWT session, mã hóa mật khẩu `bcryptjs`.
- **Validation**: Zod 3.24+.
- **Kiểm thử**: Jest 29+, ts-jest.
- **SEO & Performance**: Next.js Metadata API, dynamic Open Graph images (`next/og` ImageResponse), sitemap metadata route (`sitemap.ts`), robots metadata route (`robots.ts`), JSON-LD BreadcrumbList, font Inter tiếng Việt với `next/font`.

---

## 4. Kiến trúc thư mục

```text
├── actions/
│   └── deadline-actions.ts        # Server Actions (Create, Delete, Toggle Progress, Validate)
├── app/
│   ├── (app)/                     # Route Group cho các trang yêu cầu đăng nhập
│   │   ├── admin/                 # Tuyến đường Quản trị (SSR - Role: Admin)
│   │   ├── dashboard/             # Bảng điều khiển sinh viên (Nested Layout + SSR)
│   │   │   ├── completed/         # Route con: Deadline đã hoàn thành
│   │   │   ├── pending/           # Route con: Deadline chưa hoàn thành
│   │   │   ├── layout.tsx         # Nested Layout chứa sidebar
│   │   │   └── page.tsx           # Tổng quan tiến độ cá nhân
│   │   └── layout.tsx             # Layout chung nhóm app (Header topbar)
│   ├── (public)/                  # Route Group cho trang công khai
│   │   ├── deadlines/             # Tuyến đường danh sách (ISR 60s)
│   │   │   ├── [id]/              # Chi tiết deadline (ISR + generateStaticParams + OG image)
│   │   │   │   ├── opengraph-image.tsx   # Dynamic Open Graph Image Generator
│   │   │   │   └── page.tsx       # ISR Detail Page + JSON-LD
│   │   │   └── page.tsx           # ISR Deadlines Page
│   │   ├── login/                 # Trang đăng nhập (Ant Design Form)
│   │   ├── subjects/[slug]/       # Trang môn học (SSG + generateStaticParams)
│   │   ├── layout.tsx             # Public Layout (Header + Footer)
│   │   └── page.tsx               # Trang chủ SSG
│   ├── 403/                       # Trang thông báo quyền truy cập bị từ chối
│   ├── api/auth/[...nextauth]/    # Route Handler NextAuth
│   ├── error.tsx                  # Error Boundary với nút Thử lại
│   ├── globals.css                # CSS variables & global style
│   ├── layout.tsx                 # Root Layout (Font Inter, ThemeProvider, SessionProvider)
│   ├── loading.tsx                # Loading spinner toàn trang
│   ├── not-found.tsx              # Trang 404 tùy biến
│   ├── robots.ts                  # Robots metadata route
│   └── sitemap.ts                 # Sitemap metadata route
├── components/
│   ├── admin/                     # AdminDeadlineManager Client Component
│   ├── auth/                      # LoginForm, LogoutButton
│   ├── dashboard/                 # DashboardSidebar, DashboardDeadlineList
│   ├── deadline/                  # DeadlineCountdown, DeadlineFilterView, Client Actions
│   ├── layout/                    # PublicHeader, PublicFooter
│   └── providers/                 # AntdProvider, AuthProvider
├── data/
│   ├── deadlines.json             # Lưu trữ 12 deadline thực tế của PTIT
│   ├── progress.json              # Lưu trữ tiến độ riêng theo cặp userId + deadlineId
│   ├── subjects.json              # Lưu trữ 4 môn học chuyên ngành PTIT
│   └── users.json                 # Danh sách tài khoản demo băm mật khẩu bcrypt
├── lib/
│   ├── auth.ts                    # Cấu hình NextAuth Credentials & JWT callbacks
│   ├── data-repository.ts         # Module đọc/ghi JSON an toàn với atomic file write
│   └── permissions.ts             # Ma trận phân quyền RBAC và hàm can(role, action)
├── reports/                       # Bằng chứng đo lường thực tế (Lighthouse, Build, Tests)
├── theme/
│   └── themeConfig.ts             # Cấu hình theme token Ant Design
├── types/
│   ├── index.ts                   # Định nghĩa Subject, Deadline, Progress, User, Role
│   └── next-auth.d.ts             # Type Augmentation cho Session và JWT
├── middleware.ts                  # Bảo vệ route /dashboard và /admin, chống open redirect
├── jest.config.js                 # Cấu hình test Jest
└── package.json                   # Dependencies và scripts
```

---

## 5. Cách cài đặt

1. Đảm bảo môi trường đã cài đặt Node.js v18.17+ hoặc v20+ / v22+ và npm.
2. Clone hoặc tải mã nguồn vào thư mục làm việc:
```bash
git clone <repository_url>
cd LTW_NC_TH03
```
3. Cài đặt các gói phụ thuộc:
```bash
npm install
```

---

## 6. Cách chạy môi trường development
Khởi chạy dev server:
```bash
npm run dev
```
Mặc định ứng dụng sẽ khởi chạy tại: `http://localhost:3000` (hoặc `http://localhost:3001` nếu cổng 3000 đang bận).

---

## 7. Cách build production
Thực hiện quá trình typecheck, linting, tối ưu hóa bundle và prerender tĩnh các trang:
```bash
npm run build
```

---

## 8. Cách chạy production
Sau khi build thành công, khởi động server production:
```bash
npm start
# Hoặc chỉ định cổng lắng nghe nếu muốn:
PORT=3001 npx next start -p 3001
```

---

## 9. Tài khoản demo

Hệ thống cấu hình sẵn 2 tài khoản demo với mật khẩu được băm an toàn bằng thuật toán `bcrypt` ở phía server (không lưu plaintext, không lộ qua API):

| Vai trò | Email | Mật khẩu | Quyền hạn |
|---|---|---|---|
| **Lớp trưởng (Admin)** | `admin@ptit.edu.vn` | `admin123` | Toàn quyền xem deadline, đánh dấu tiến độ, thêm deadline mới, xóa deadline, truy cập `/admin` |
| **Sinh viên (User)** | `sv@ptit.edu.vn` | `sv123456` | Xem deadline, truy cập `/dashboard`, đánh dấu hoàn thành bài tập cá nhân, bị cấm truy cập `/admin` |

---

## 10. Cách cấu hình biến môi trường
Tạo file `.env.local` ở thư mục gốc (hoặc tham khảo file `.env.example`):
```env
# Chuỗi bí mật ngẫu nhiên dùng để ký và mã hóa JWT Token (Auth.js / NextAuth)
# Có thể sinh ngẫu nhiên bằng lệnh: openssl rand -base64 32
NEXTAUTH_SECRET=class_deadline_hub_super_secret_jwt_key_2026_ptit

# URL cơ sở của ứng dụng trong môi trường đang chạy
NEXTAUTH_URL=http://localhost:3001

# Base URL cho việc tạo link sitemap, canonical URL và Open Graph images
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Cổng port của ứng dụng
PORT=3001
```

---

## 11. Giải thích chiến lược rendering cho từng route

Hệ thống được thiết kế chuẩn mực theo đúng yêu cầu kiến trúc của Next.js App Router:

| Tuyến đường | Chiến lược | Cấu hình kỹ thuật | Giải thích lý do |
|---|---|---|---|
| `/` | **SSG** (Static Site Generation) | `export const dynamic = 'force-static'` | Trang landing page chứa thông tin công khai, giới thiệu chung và thống kê tính trước từ JSON. Được prerender tại build time giúp tốc độ phản hồi tức thì và tối ưu SEO tối đa. |
| `/subjects/[slug]` | **SSG** | `generateStaticParams()` prerender 4 môn học | Danh sách môn học cố định. Next.js prerender sẵn 4 file HTML tĩnh cho 4 môn học tại build time. Slug không hợp lệ được chuyển sang `notFound()`. |
| `/deadlines` | **ISR 60s** (Incremental Static Regeneration) | `export const revalidate = 60` | Danh sách bài tập công khai cần được cache tĩnh để phục vụ nhanh, nhưng vẫn tự động tái tạo dữ liệu mới sau mỗi 60 giây khi có sinh viên truy cập. |
| `/deadlines/[id]` | **ISR + On-Demand Invalidation** | `generateStaticParams()` + `revalidate = 60` + `revalidatePath` | Prerender sẵn toàn bộ 12 deadline chi tiết. Cho phép làm mới dữ liệu định kỳ và kích hoạt xóa cache tức thì (On-demand) ngay khi Admin thêm hoặc xóa deadline. |
| `/dashboard` | **SSR** (Server-Side Rendering) | `export const dynamic = 'force-dynamic'` | Dữ liệu cá nhân phụ thuộc vào phiên làm việc (`Session`) của sinh viên hiện tại. Không được cache công khai để bảo mật thông tin tiến độ riêng biệt. |
| `/admin` | **SSR** | `export const dynamic = 'force-dynamic'` | Giao diện quản trị yêu cầu kiểm tra danh tính và quyền admin trực tiếp từ cookie session phía máy chủ trên mỗi request. |

---

## 12. Bằng chứng thực tế: Kết quả `npm run build`

Dưới đây là log thực tế khi chạy lệnh `npm run build` trên hệ thống:

```text
> class-deadline-hub@1.0.0 build
> next build

  ▲ Next.js 14.2.35
  - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/29) ...
   Generating static pages (7/29) 
   Generating static pages (14/29) 
   Generating static pages (21/29) 
 ✓ Generating static pages (29/29)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                      Size     First Load JS
┌ ○ /                                            1.9 kB          149 kB
├ ○ /_not-found                                  142 B            88 kB
├ ○ /403                                         272 B           153 kB
├ ƒ /admin                                       47.6 kB         398 kB
├ ƒ /api/auth/[...nextauth]                      0 B                0 B
├ ƒ /dashboard                                   6.14 kB         351 kB
├ ƒ /dashboard/completed                         1.98 kB         328 kB
├ ƒ /dashboard/pending                           1.98 kB         328 kB
├ ○ /deadlines                                   2.92 kB         270 kB
├ ● /deadlines/[id]                              5.39 kB         235 kB
├   ├ /deadlines/dl_01
├   ├ /deadlines/dl_02
├   ├ /deadlines/dl_03
├   └ [+9 more paths]
├ ƒ /deadlines/[id]/opengraph-image              0 B                0 B
├ ƒ /deadlines/[id]/opengraph-image-104vc5       0 B                0 B
├ ○ /login                                       21 kB           256 kB
├ ○ /robots.txt                                  0 B                0 B
├ ○ /sitemap.xml                                 0 B                0 B
└ ● /subjects/[slug]                             3.9 kB          217 kB
    ├ /subjects/lap-trinh-web-nang-cao
    ├ /subjects/kien-truc-may-tinh-he-dieu-hanh
    ├ /subjects/co-so-du-lieu-phan-tan
    └ /subjects/an-toan-bao-mat-thong-tin
+ First Load JS shared by all                    87.8 kB
  ├ chunks/2117-c37fcbc8e578eed5.js              32 kB
  ├ chunks/fd9d1056-c950d8fb32a91e75.js          53.8 kB
  └ other shared chunks (total)                  1.97 kB

ƒ Middleware                                     48.5 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand
```

---

## 13. Bằng chứng đo lường Lighthouse: Trang chủ (`/`)

Đo trên môi trường **Production Build** (`npm run build` -> `npm start` trên cổng 3001) bằng công cụ **Lighthouse 13.5.0** (Engine Chromium Brave Browser headless):

- **Thời điểm đo**: 2026-10-27T14:14:52+07:00
- **URL**: `http://localhost:3001/`
- **Kết quả đo lường (Desktop)**:
  - **Performance**: **100 / 100**
  - **Accessibility**: **95 / 100**
  - **Best Practices**: **96 / 100**
  - **SEO**: **100 / 100**
- **Chi tiết chỉ số Web Vitals**:
  - First Contentful Paint (FCP): 0.3 s
  - Largest Contentful Paint (LCP): 0.5 s
  - Total Blocking Time (TBT): 0 ms
  - Cumulative Layout Shift (CLS): 0
  - Speed Index: 0.4 s

---

## 14. Bằng chứng đo lường Lighthouse: Trang chi tiết (`/deadlines/dl_01`)

Đo trên môi trường **Production Build** với trang chi tiết bài tập thực tế:

- **Thời điểm đo**: 2026-10-27T14:15:19+07:00
- **URL**: `http://localhost:3001/deadlines/dl_01`
- **Kết quả đo lường (Desktop)**:
  - **Performance**: **100 / 100**
  - **Accessibility**: **96 / 100**
  - **Best Practices**: **96 / 100**
  - **SEO**: **100 / 100**
- **Chi tiết chỉ số Web Vitals**:
  - First Contentful Paint (FCP): 0.3 s
  - Largest Contentful Paint (LCP): 0.5 s
  - Total Blocking Time (TBT): 0 ms
  - Cumulative Layout Shift (CLS): 0.002
  - Speed Index: 0.5 s

---

## 15. Bằng chứng View-Source của `/deadlines/dl_01`

Khi gọi `curl -s http://localhost:3001/deadlines/dl_01`, HTML trả về đã được prerender đầy đủ nội dung, thẻ meta Open Graph và JSON-LD mà không cần chờ JavaScript client render:

```html
<!-- Trích xuất từ reports/view-source-deadline-1.html -->
<title>Báo cáo Thực hành 01: Next.js App Router &amp; SSG/ISR - INT1416 | Class Deadline Hub</title>
<meta name="description" content="Xây dựng ứng dụng portal trường học với App Router, triển khai Rendering SSG cho danh mục tĩnh và ISR 60s cho danh sách động."/>
<link rel="canonical" href="http://localhost:3001/deadlines/dl_01"/>
<meta property="og:title" content="Báo cáo Thực hành 01: Next.js App Router &amp; SSG/ISR | Class Deadline Hub"/>
<meta property="og:image" content="http://localhost:3001/deadlines/dl_01/opengraph-image"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:type" content="article"/>

<!-- JSON-LD BreadcrumbList chuẩn Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "http://localhost:3001" },
    { "@type": "ListItem", "position": 2, "name": "Danh sách Deadline", "item": "http://localhost:3001/deadlines" },
    { "@type": "ListItem", "position": 3, "name": "Báo cáo Thực hành 01: Next.js App Router & SSG/ISR", "item": "http://localhost:3001/deadlines/dl_01" }
  ]
}
</script>
```

---

## 16. Giải thích Cache và Invalidation

Next.js App Router quản lý nhiều lớp cache:
1. **Full Route Cache (Server-side HTML/RSC)**: Lưu trữ các route tĩnh (`/`, `/subjects/[slug]`, `/deadlines`, `/deadlines/[id]`).
2. **Data Cache**: Lưu trữ kết quả đọc dữ liệu.
3. **Router Cache (Client-side in-memory)**: Cache phía trình duyệt để chuyển trang không bị giật lag.

### Cơ chế Invalidation:
- **Time-based Revalidation**: Thiết lập `export const revalidate = 60` cho `/deadlines` và `/deadlines/[id]`. Khi có request sau khoảng thời gian 60 giây, Next.js ngầm kích hoạt tạo lại trang mới và tráo đổi cache mà không bắt người dùng phải chờ (stale-while-revalidate).
- **On-demand Revalidation**: Trong Server Action `createDeadlineAction` và `deleteDeadlineAction`, hệ thống gọi:
  ```ts
  revalidatePath('/');
  revalidatePath('/deadlines');
  revalidatePath(`/deadlines/${id}`);
  revalidatePath(`/subjects/${subject.slug}`);
  revalidatePath('/sitemap.xml');
  ```
  Nhờ đó, ngay khi Lớp trưởng thêm hoặc xóa deadline, cache cũ bị thu hồi ngay lập tức trên máy chủ mà không cần chờ hết chu kỳ 60 giây.

---

## 17. Giới hạn của JSON File khi Deploy
- **Môi trường Serverless (như Vercel)**: Hệ thống tệp (filesystem) là tạm thời (ephemeral) và chỉ đọc (read-only) trong quá trình thực thi các hàm lambda serverless. Mọi thao tác ghi file cục bộ vào `data/*.json` sẽ bị mất sau khi container bị hủy hoặc không đồng bộ giữa các vùng địa lý khác nhau.
- **Giải pháp cho triển khai thực tế**:
  - Sử dụng cơ sở dữ liệu quan hệ (PostgreSQL với **Prisma** hoặc **Drizzle ORM**, Supabase, Neon) hoặc cơ sở dữ liệu tài liệu (MongoDB, PostgreSQL JSONB).
  - Sử dụng kho lưu trữ phân tán có hỗ trợ ACID transactions để quản lý ghi đồng thời và sao lưu dữ liệu bền vững.

---

## 18. Cách chạy Jest và Kiểm thử bảo mật

Toàn bộ 29 ca kiểm thử bảo mật và logic ma trận quyền RBAC được viết trong thư mục `__tests__/`.
Để chạy bộ kiểm thử:
```bash
npm test
```
Kết quả kiểm thử thực tế:
```text
PASS __tests__/server-actions.test.ts
PASS __tests__/permissions.test.ts

Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        0.188 s
Ran all test suites.
```
Bao gồm:
- Toàn bộ ma trận quyền của `can(role, action)` cho `guest`, `user`, `admin`.
- Xử lý các đầu vào độc hại, role không xác định, action không hợp lệ.
- Chặn sinh viên thường (`user`) cố tình gọi action thêm/xóa deadline của admin.
- Chặn người dùng chưa đăng nhập.
- Kiểm tra tính toàn vẹn của Zod schema và đảm bảo sinh viên chỉ được cập nhật tiến độ của chính mình.

---

## 19. Các lỗi thường gặp và cách xử lý
1. **Lỗi `EADDRINUSE: address already in use :::3000`**:
   - Nguyên nhân: Cổng 3000 đang được tiến trình khác sử dụng.
   - Xử lý: Đổi sang cổng `3001` trong file `.env.local` (`PORT=3001`) và khởi chạy với `PORT=3001 npx next start -p 3001`.
2. **Hydration Mismatch với đồng hồ đếm ngược**:
   - Nguyên nhân: Thời gian của máy chủ và thời gian của trình duyệt người dùng chênh lệch nhau khi render lần đầu.
   - Xử lý: Component `DeadlineCountdown` sử dụng state `mounted` với `useEffect`, hiển thị nhãn placeholder trước khi client mount hoàn tất.
3. **Open Redirect Vulnerability khi đăng nhập**:
   - Nguyên nhân: Tham số `callbackUrl` bị kẻ xấu chèn URL độc hại bên ngoài.
   - Xử lý: `middleware.ts` và `LoginForm.tsx` kiểm tra bắt buộc `callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')`.

---

## Trả lời câu hỏi lý thuyết

### Câu 1: Vì sao `/deadlines/[id]` dùng ISR?
Trang chi tiết deadline có nội dung công khai, tương đối ổn định (tiêu đề bài tập, mô tả, hạn nộp ít khi thay đổi liên tục từng giây). Nếu sử dụng SSR (Server-Side Rendering) thông thường, máy chủ sẽ phải tính toán và truy vấn dữ liệu cho từng request, gây lãng phí tài nguyên và làm tăng thời gian phản hồi (TTFB). Mặt khác, nếu chỉ sử dụng SSG thuần túy, khi Lớp trưởng cập nhật hoặc thêm deadline mới, toàn bộ ứng dụng sẽ phải build lại từ đầu.

**ISR (Incremental Static Regeneration)** giải quyết triệt để vấn đề này:
1. **Prerender & Performance**: Các deadline có sẵn được tạo trước thành file HTML tĩnh thông qua `generateStaticParams()`. Khách truy cập hoặc bot tìm kiếm (Googlebot) sẽ nhận được phản hồi tức thì với điểm SEO và Performance đạt tối đa (100 điểm Lighthouse).
2. **Time-based Revalidation**: Thiết lập `revalidate = 60` cho phép trang tự động cập nhật lại nội dung ngầm sau mỗi 60 giây khi có yêu cầu mới mà không làm gián đoạn người dùng.
3. **On-demand Revalidation**: Kết hợp với Server Action, khi Admin thực hiện thêm hoặc xóa deadline, máy chủ gọi `revalidatePath('/deadlines/[id]')` để xóa cache ngay lập tức, đảm bảo tính nhất quán dữ liệu mà không cần render lại toàn bộ trang web cho mọi lượt truy cập.

---

### Câu 2: Nếu chỉ dùng Middleware để bảo vệ `/admin` thì có rủi ro gì?
Chỉ dùng Middleware là **không đủ** và tạo ra lỗ hổng bảo mật nghiêm trọng vì những lý do sau:
1. **Middleware chỉ là lớp cổng vào giao diện (Edge/Routing Gate)**: Middleware kiểm tra URL pathname khi người dùng điều hướng qua trình duyệt. Tuy nhiên, các **Server Actions** trong Next.js App Router bản chất là các endpoint POST HTTP riêng biệt được mã hóa ID.
2. **Nguy cơ Bypass thao tác nhạy cảm**: Kẻ tấn công hoặc người dùng có tài khoản sinh viên thường (`role: user`) có thể giả lập request trực tiếp tới Server Action thêm/xóa deadline (thông qua công cụ như Postman, cURL hoặc fetch script) mà không cần truy cập vào URL `/admin`. Nếu Server Action không tự xác thực session và không gọi hàm `can(session.user.role, 'delete_deadline')`, kẻ tấn công có thể xóa sạch dữ liệu deadline của cả lớp.
3. **Nguyên tắc Defense in Depth (Bảo vệ đa tầng)**: Bảo mật phía client (ẩn nút, ẩn menu) hoặc bảo mật mức định tuyến (Middleware) chỉ mang tính chất trải nghiệm người dùng. Mọi thao tác đọc/ghi dữ liệu nhạy cảm **bắt buộc phải kiểm tra quyền (Authorization) tại chính Server Action và Data Repository** ở phía máy chủ.

