# Bộ Câu Hỏi Phản Biện & Câu Trả Lời Chuẩn Bị (Q&A Defense) — ProcureAI

> **Dự án:** ProcureAI — Internal Procurement & Approval Platform  
> **Tài liệu:** Tổng hợp các câu hỏi hóc búa từ Giảng viên / Hội đồng phản biện và Câu trả lời có căn cứ kỹ thuật  
> **Mục tiêu:** Giúp nhóm tự tin, đĩnh đạc, trả lời sắc sảo, trung thực và dựa trên bằng chứng kiểm thử thực tế.

---

## NHÓM 1: CÂU HỎI VỀ QUY TRÌNH NGHIỆP VỤ & QUẢN TRỊ (BUSINESS & GOVERNANCE)

### Câu 1: "Tại sao nhóm lại đặt nặng quy tắc No Self-Approval? Trong thực tế doanh nghiệp quy tắc này quan trọng thế nào?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, quy tắc **No Self-Approval (Không tự phê duyệt)** là nguyên tắc cốt tử trong quản trị rủi ro và kiểm soát nội bộ (Internal Control) của mọi doanh nghiệp, xuất phát từ tiêu chuẩn kiểm toán COSO và nguyên tắc 'Bốn mắt' (Four-Eyes Principle).
  > 
  > Nếu một hệ thống cho phép Trưởng phòng tự tạo đề xuất mua sắm thiết bị cá nhân rồi tự bấm duyệt, điều đó tạo ra kẽ hở xung đột lợi ích (conflict of interest) và nguy cơ biển thủ ngân sách công ty.
  > 
  > Trong ProcureAI, ngay cả khi một người dùng có chức danh Manager, họ chỉ có quyền duyệt yêu cầu của cấp dưới. Nếu chính họ có nhu cầu mua sắm, họ phải đóng vai trò Requester, và yêu cầu đó bắt buộc phải chuyển lên cấp trên hoặc một Manager ngang hàng có thẩm quyền khác duyệt. Đây là điểm phân biệt giữa một phần mềm quản lý bài bản và một ứng dụng đồ án thông thường."
* **Căn cứ tài liệu:** [`docs/02-vault/company-policies.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/02-vault/company-policies.md), [`docs/01-plans/requirement-traceability-matrix.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/01-plans/requirement-traceability-matrix.md#L45).

---

### Câu 2: "Hạn mức phê duyệt ngân sách được phân cấp thế nào trong hệ thống? Nếu PR vượt ngân sách phòng ban thì xử lý ra sao?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, hệ thống phân cấp hạn mức phê duyệt theo chính sách tài chính chuẩn:
  > 1. **Dưới 50.000.000 VNĐ:** Trưởng phòng ban (Manager) có toàn quyền phê duyệt nếu số dư ngân sách phòng ban khả dụng còn đủ.
  > 2. **Từ 50.000.000 VNĐ trở lên:** Sau khi Manager đồng ý, hệ thống tự động định tuyến (auto-route) sang trạng thái `finance_review` để Kế toán trưởng (Finance) thẩm định lần hai.
  > 3. **Trường hợp Vượt ngân sách (Budget Overrun):** Hệ thống không tự ý từ chối ngay mà hiển thị cảnh báo đỏ thời gian thực cho người tạo và người duyệt. Yêu cầu này bắt buộc phải chuyển sang bộ phận Tài chính để xem xét chuyển nguồn dự phòng (contingency fund) hoặc từ chối chính thức kèm lý do."
* **Căn cứ tài liệu:** Quy tắc nghiệp vụ `REQ-BR-03`, `REQ-BR-04` trong [`docs/01-discovery/requirements.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/01-discovery/requirements.md).

---

## NHÓM 2: CÂU HỎI VỀ KIẾN TRÚC & TÍCH HỢP AI (ARCHITECTURE & AI)

### Câu 3: "Tại sao nhóm lại kết hợp Django với React SPA thay vì dùng Django Template truyền thống?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, nhóm lựa chọn kiến trúc decoupled (tách biệt) giữa React SPA và Django REST API vì 3 lý do chiến lược:
  > 1. **Trải nghiệm người dùng tương tác cao (Rich UX):** Quy trình mua sắm có các màn hình động phức tạp như ma trận so sánh nhiều báo giá, thanh chat AI gợi ý tức thời và chuyển đổi nhanh giữa 5 vai trò. React SPA cho phép cập nhật DOM mượt mà không phải tải lại toàn bộ trang (no full-page reload).
  > 2. **Phân tách trách nhiệm (Separation of Concerns):** Frontend tập trung hoàn toàn vào hiển thị và trải nghiệm, trong khi Django tập trung vào bảo vệ toàn vẹn dữ liệu, xác thực quyền hạn và logic nghiệp vụ.
  > 3. **Khả năng mở rộng (Extensibility):** Hệ thống REST API của Django có thể dễ dàng phục vụ thêm ứng dụng di động (Mobile App) cho ban lãnh đạo duyệt đơn trong tương lai mà không cần viết lại logic máy chủ."
* **Căn cứ tài liệu:** [`docs/05-technical/backend_architecture.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/05-technical/backend_architecture.md).

---

### Câu 4: "Mô hình AI Gemini được tích hợp như thế nào? Nếu mất kết nối Internet hoặc API hết hạn mức thì hệ thống có sập không?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, nhóm tích hợp mô hình **Google Gemini 2.5 Flash** thông qua dịch vụ backend tại [`procurement/gemini_service.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/gemini_service.py) và REST API `/api/v1/ai/standardize/`.
  > 
  > Về khả năng chịu lỗi: Nhóm quán triệt nguyên tắc **AI chỉ đóng vai trò hỗ trợ gợi ý (Recommendation), không quyết định thay con người và không được là điểm nghẽn duy nhất (Single Point of Failure)**.
  > 
  > Nếu mạng bị ngắt, API key hết quota hoặc Gemini trả về mã lỗi 429/500, hệ thống tự động kích hoạt **Heuristic Fallback Engine** dựa trên các biểu thức chính quy (Regex) và từ điển danh mục nội bộ tại `procurement/services.py`. Thuật toán fallback này vẫn bóc tách được số lượng, ngày cần hàng và đơn giá ước tính để người dùng tiếp tục công việc bình thường."
* **Căn cứ tài liệu:** [`docs/05-technical/ai_gemini_integration.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/05-technical/ai_gemini_integration.md), kiểm chứng tại [`procurement/services.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/services.py#L90-L130).

---

## NHÓM 3: CÂU HỎI VỀ KIỂM THỬ & CHẤT LƯỢNG (TESTING & DEFECTS)

### Câu 5: "Tôi thấy báo cáo ghi Backend đạt 53/53 tests PASS, nhưng Frontend lại FAIL ESLint và TypeScript. Nhóm giải thích thế nào về sự mâu thuẫn này?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, đây là sự khác biệt giữa **Kiểm thử hành vi chức năng (Functional Testing)** và **Kiểm tra cú pháp tĩnh (Static Code Analysis)**:
  > - **Backend đạt 53/53 tests PASS (100%):** Chứng minh toàn bộ các quy tắc tính toán, luồng chuyển đổi trạng thái đơn hàng, kiểm tra ngân sách và cơ chế bảo mật No Self-Approval đều hoạt động hoàn hảo và chính xác tuyệt đối trên máy chủ.
  > - **Lệnh `npm run build` đạt BUILD PASS:** Chứng minh bundler Vite đã biên dịch và đóng gói thành công 2,380 modules thành các tệp chạy được mà không bị lỗi biên dịch nghiêm trọng.
  > - **ESLint còn 2 lỗi (`BUG-0002`, `BUG-0003`) & TypeScript còn 69 cảnh báo kiểu (`BUG-0004`):**
    - `BUG-0002`: Do một câu lệnh gán regex trong vòng lặp `while` tại `aiStandardizer.ts:72` vi phạm luật `no-cond-assign`.
    - `BUG-0003`: Một hàm rỗng chưa điền nội dung trong context.
    - `BUG-0004`: Chủ yếu là các biến import `React` thừa và định nghĩa kiểu JSX cho icon `BoxIcon`.
  > Các lỗi này thuộc mức độ răn đe chuẩn mã nguồn (Code Style & Strict Types), **không làm hỏng logic nghiệp vụ ở thời điểm runtime demo**, nhưng nhóm đã ghi nhận thành các Defect chính thức và cam kết xử lý trước khi đóng gói phát hành Production."
* **Căn cứ tài liệu:** [`docs/06-testing/final-test-report.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/final-test-report.md#L30-L38), [`docs/06-testing/04-defects/bug-triage-report.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/04-defects/bug-triage-report.md).

---

### Câu 6: "Lỗ hổng No Self-Approval (BUG-0001) đã được kiểm chứng thế nào? Có thể khẳng định toàn bộ hệ thống phân quyền 5 vai trò đã an toàn 100% chưa?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, nhóm xin trả lời thành thật và chính xác theo ranh giới kỹ thuật:
  > 
  > 1. **Những gì ĐÃ ĐƯỢC kiểm chứng an toàn 100%:**
  >    - Cơ chế **No Self-Approval đối với thao tác duyệt PR** đã được nhóm viết test method chuyên biệt [`test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/test_gov01_gov02.py#L196) và kiểm thử thành công qua 4 kịch bản tấn công: Giả mạo session, giả mạo actorId trong payload JSON, gọi ẩn danh không có actor, và trường hợp người duyệt hợp lệ khác. Tất cả các nỗ lực tự duyệt đều bị server chặn đứng với HTTP 403.
  > 
  > 2. **Những gì CHƯA ĐƯỢC khẳng định 100%:**
  >    - Trong báo cáo `QA-11A` và `final-test-report.md`, nhóm QA đã nêu rõ: **Không được suy diễn rằng toàn bộ 5 vai trò RBAC trên mọi endpoint REST API đã an toàn tuyệt đối.**
  >    - Hiện tại, việc kiểm tra quyền hạn của các hành động khác (như chỉ có Procurement mới được tạo PO, chỉ có Finance mới được đóng PO) mới được bảo vệ bằng logic giao diện Frontend và các hàm model Django, nhưng chưa có bộ automated integration test ở tầng REST API cho toàn bộ các route phụ đó. Nhóm xem đây là hạng mục cần bổ sung kiểm thử trong giai đoạn tiếp theo."
* **Căn cứ tài liệu:** [`docs/06-testing/final-test-report.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/final-test-report.md#L40-L63).

---

### Câu 7: "Tại sao trong báo cáo thẩm định QA-12A lại kết luận Local Demo là `LOCAL DEMO NOT VERIFIED` mà không cho PASS?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, đây là minh chứng cho sự **nghiêm ngặt và độc lập** của quy trình Đảm bảo Chất lượng (QA) trong nhóm chúng em:
  > 
  > Ở đợt kiểm thử QA-12, máy chủ đã phản hồi tốt các lệnh kiểm tra HTTP từ Python script. Tuy nhiên, khi nhóm QA thẩm định độc lập lại ở lượt QA-12A:
  > 1. Nhóm áp dụng nguyên tắc: **Chỉ có API request bằng Python thì chưa thể coi là đã kiểm thử giao diện người dùng**. Do công cụ Playwright tự động bị chặn tải driver từ xa và con người chưa click chuột thật trên trình duyệt để ghi lại bằng chứng, nhóm kiên quyết chuyển trạng thái UI thành `NOT RUN` hoặc `NOT VERIFIED`.
  > 2. Nghiêm trọng hơn, QA-12A đã soi kỹ đến tận header `Content-Type` và đường dẫn asset, qua đó phát hiện sau khi merge git, file `index.html` gọi script `index-eMT3_iPN.js` bị trả về **HTTP 404** do chưa chạy lại lệnh build.
  > 
  > Nếu một nhóm QA hời hợt, họ sẽ vội vã kết luận PASS và khi bước vào buổi demo thật sẽ bị trắng màn hình. Nhờ sự khắt khe của QA-12A, nhóm đã phát hiện ra lỗi thiếu bundle này trước giờ thuyết trình và chỉ cần chạy lại `npm run build` là hệ thống demo hoàn hảo."
* **Căn cứ tài liệu:** [`docs/06-testing/evidence/RUN-20261010-011000/execution-summary.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-011000/execution-summary.md).

---

## NHÓM 4: CÂU HỎI VỀ TRIỂN KHAI & PHÁT HÀNH (DEPLOYMENT & RELEASE)

### Câu 8: "Dự án đã sẵn sàng đưa vào vận hành trên Production thực tế chưa? Tại sao báo cáo lại ghi `BLOCKED / NOT READY`?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, dự án hiện tại **CHƯA ĐỦ ĐIỀU KIỆN** để phát hành môi trường Production thương mại, và việc nhóm QA đánh dấu **`BLOCKED / NOT READY`** là hoàn toàn chuẩn mực theo quy trình công nghệ phần mềm:
  > 
  > Để một sản phẩm được phép lên Production, hệ thống phải vượt qua 7 cổng chất lượng (Quality Gates). Hiện tại dự án đang bị chặn bởi 3 lý do:
  > 1. **Chất lượng mã nguồn:** Đường ống CI/CD yêu cầu 0 lỗi lint và 0 lỗi typecheck, trong khi Frontend còn 2 lỗi ESLint và 69 lỗi TypeScript.
  > 2. **Cấu hình bảo mật máy chủ:** Môi trường hiện tại là cấu hình máy trạm nhà phát triển (`DEBUG=True`, `SECRET_KEY` mặc định, chưa có chứng chỉ SSL/HTTPS bắt buộc).
  > 3. **Cơ sở dữ liệu:** Test suite đang chạy trên SQLite in-memory, cần chuyển đổi và thẩm định tương thích trên hệ quản trị CSDL chuyên dụng như PostgreSQL trước khi phục vụ người dùng thực tế.
  > 
  > Vì vậy, dự án hoàn toàn sẵn sàng cho **Local Demo phục vụ học tập**, nhưng bị chặn nghiêm ngặt đối với **Production thương mại**."
* **Căn cứ tài liệu:** [`docs/06-testing/release-readiness.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/release-readiness.md#L80-L96).

---

### Câu 9: "Các lỗi `BUG-0002` đến `BUG-0005` còn mở có kế hoạch khắc phục ra sao?"
* **Câu trả lời chuẩn bị:**
  > "Dạ thưa Thầy/Cô, cả 4 lỗi trên đều đã được phân loại chi tiết (Triage) tại [`docs/06-testing/04-defects/bug-triage-report.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/04-defects/bug-triage-report.md) với giải pháp cụ thể:
  > - **`BUG-0002` (Regex assignment):** Thêm cặp ngoặc tròn bọc biểu thức gán `while ((match = regex.exec(text)))` để thỏa mãn rule `no-cond-assign` (Thời gian xử lý: 5 phút).
  > - **`BUG-0003` (Empty function):** Bổ sung dòng comment giải thích hoặc lệnh no-op tại `ProcurementContext.tsx:76` (Thời gian xử lý: 5 phút).
  > - **`BUG-0004` (69 lỗi TS):** Xóa các import `React` không sử dụng sau khi nâng cấp lên React 18 JSX transform và khai báo kiểu `BoxIconProps` rõ ràng (Thời gian xử lý: 1 giờ).
  > - **`BUG-0005` (Legacy Node test):** Di chuyển các file test cũ không dùng vào thư mục lưu trữ `tests/archive/` (Thời gian xử lý: 5 phút).
  > 
  > Nhóm dự kiến hoàn thành dứt điểm cả 4 bug này ngay trong Sprint tiếp theo."
* **Căn cứ tài liệu:** [`docs/06-testing/04-defects/BUG_TRACKER.md`](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/04-defects/BUG_TRACKER.md).
