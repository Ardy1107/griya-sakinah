# Plan: Fitur Invoice Penagihan Internet Griya Sakinah

## Overview
Menambahkan modul dan menu **Invoice Penagihan Internet** pada dashboard Admin Griya Sakinah untuk mengelola warga yang berstatus **menunggu pembayaran** (belum lunas) pada periode terpilih. Admin dapat melihat daftar tagihan aktif, mengunduh lembar invoice resmi dalam format **PDF** dan **PNG**, mengirimkan tagihan via WhatsApp, dan ketika pembayaran telah dicatat oleh admin, tagihan warga tersebut otomatis **hilang dari daftar**.

## Project Type
**WEB** (React + Vite + Supabase + Vanilla CSS / Modern CSS Modules)

## Success Criteria
1. ✅ Menu tab baru **"Invoice Tagihan"** tersedia di sidebar Admin Panel (grup `KELOLA DATA`).
2. ✅ Menampilkan daftar warga yang belum bayar (`!r.isPaid`) untuk blok aktif (A atau B) dan periode bulan/tahun terpilih.
3. ✅ Perhitungan akumulasi tunggakan: menghitung seluruh bulan yang belum dibayar oleh warga sepanjang riwayat database hingga bulan berjalan.
4. ✅ Lembar Invoice Digital (`DigitalInvoice.jsx`) menampilkan:
   - Header banner Griya Sakinah Internet
   - Nomor Invoice unik (`INV/TAHUN/BULAN/BLOK-NO`)
   - Status badge: **"TERLEWAT JATUH TEMPO (OVERDUE)"** (jika tanggal > 5) atau **"MENUNGGU PEMBAYARAN"** (jika tanggal <= 5)
   - Tanggal Jatuh Tempo (Tanggal 5 setiap bulan)
   - Data warga (Nama, Blok rumah, No WA)
   - Rincian biaya: Iuran bulan berjalan + rincian tunggakan bulan sebelumnya jika ada
   - Total nominal yang harus dibayar
   - Detail rekening tujuan transfer:
     - Blok A: Bank BSI `7276140919` a.n. Ardyanto Pri Utomo (dengan tombol salin rekening)
     - Blok B: Bank Mandiri `1480023234738` a.n. Ardyanto Pri Utomo (dengan tombol salin rekening)
5. ✅ Ekspor PDF dan PNG berkualitas tinggi via `html2canvas` & `jspdf` (`invoiceImage.js`).
6. ✅ Fitur kirim link rincian tagihan via WhatsApp ke warga terkait.
7. ✅ Tombol jalan pintas "Bayar Sekarang" yang langsung membuka form pelunasan untuk warga tersebut.
8. ✅ Reaktivitas: Saat pembayaran diinput/dilunasi, data invoice warga langsung hilang seketika dari tabel invoice aktif.
9. ✅ Zero Purple Violation (mematuhi aturan warna dan standar desain premium Griya Sakinah).

---

## Tech Stack & Rationale
- **React 18**: UI component library
- **html2canvas & jspdf**: Client-side rendering untuk ekspor PDF dan PNG tanpa perlu backend serverless tambahan
- **Lucide React**: Konsistensi icon UI (FileText, Download, CheckCircle, AlertTriangle, Copy, Share2)
- **Supabase**: Realtime database untuk state `payments` dan `residents`

---

## File Structure

```
src/modules/internet/
├── components/
│   ├── DigitalInvoice.jsx        # [NEW] Modal Preview & Print Invoice Tagihan
│   ├── InvoiceTab.jsx            # [NEW] Komponen Tab Menu Invoice Tagihan di Admin Panel
│   └── ...
├── utils/
│   ├── invoiceImage.js          # [NEW] Generator PDF & PNG untuk invoice penagihan
│   └── ...
├── pages/
│   ├── AdminPanel.jsx           # [UPDATE] Integrasi Tab 'invoice' dan modal handler
│   └── ...
└── index.css                    # [UPDATE] Styling untuk invoice card, overdue badge, dan aksi
```

---

## Task Breakdown

### Task 1: Utility Generator PDF & PNG Invoice
- **task_id**: `TASK-01-UTIL-INVOICE-IMAGE`
- **name**: Membuat generator HTML-to-Canvas, PDF, dan PNG untuk Invoice Penagihan
- **agent**: `frontend-specialist`
- **skills**: `clean-code`, `frontend-design`
- **priority**: P1
- **dependencies**: None
- **INPUT**: Data resident, invoice details (bulan, tahun, nominal, breakdown tunggakan, bank info, status overdue)
- **OUTPUT**: `src/modules/internet/utils/invoiceImage.js` dengan fungsi `downloadInvoicePdf`, `downloadInvoicePng`
- **VERIFY**: Fungsi dapat me-render elemen invoice capture di offscreen DOM dan men-download file dengan nama `Invoice_Blok[X]_[Bulan]_[Tahun].pdf/.png`

### Task 2: Komponen Modal Digital Invoice
- **task_id**: `TASK-02-COMPONENT-DIGITAL-INVOICE`
- **name**: Membuat komponen `DigitalInvoice.jsx` dengan badge status Overdue / Menunggu Pembayaran, rekening bank blok, tombol salin, download PDF/PNG, dan share WA
- **agent**: `frontend-specialist`
- **skills**: `frontend-design`, `clean-code`, `web-design-guidelines`
- **priority**: P1
- **dependencies**: `TASK-01-UTIL-INVOICE-IMAGE`
- **INPUT**: Props `resident`, `currentPeriod`, `unpaidMonths`, `blockConfig`, `onClose`, `onPayNow`
- **OUTPUT**: `src/modules/internet/components/DigitalInvoice.jsx`
- **VERIFY**: Tampilan modal invoice responsif di mobile & desktop, watermark penagihan jelas, warna sesuai (Emerald/Amber/Rose, no purple), tombol download PDF/PNG berfungsi mulus

### Task 3: Komponen Tab Menu Invoice Penagihan
- **task_id**: `TASK-03-COMPONENT-INVOICE-TAB`
- **name**: Membuat tab view `InvoiceTab.jsx` untuk daftar warga yang belum bayar
- **agent**: `frontend-specialist`
- **skills**: `frontend-design`, `react-best-practices`
- **priority**: P1
- **dependencies**: `TASK-02-COMPONENT-DIGITAL-INVOICE`
- **INPUT**: Props `residents`, `statusList`, `allPayments`, `selectedPeriod`, `adminBlockFilter`, `onOpenPayment`
- **OUTPUT**: `src/modules/internet/components/InvoiceTab.jsx`
- **VERIFY**:
  - Tabel dan grid daftar tagihan hanya menampilkan `!r.isPaid`
  - Ringkasan statistik (Total Tagihan Tertunggak, Warga Belum Bayar, Total Nominal)
  - Fitur pencarian warga
  - Tombol aksi per baris: Preview/Print, Download PDF, Download PNG, Kirim WA, dan Bayar Sekarang

### Task 4: Integrasi ke AdminPanel.jsx & Navigasi Tab
- **task_id**: `TASK-04-INTEGRATE-ADMIN-PANEL`
- **name**: Mendaftarkan tab `invoice` di daftar `TABS` AdminPanel dan menghubungkan event handler
- **agent**: `frontend-specialist`
- **skills**: `react-best-practices`
- **priority**: P1
- **dependencies**: `TASK-03-COMPONENT-INVOICE-TAB`
- **INPUT**: `src/modules/internet/pages/AdminPanel.jsx`
- **OUTPUT**: Tab navigasi baru "Invoice Tagihan" dengan icon `FileText`, badge jumlah warga belum lunas
- **VERIFY**: Memilih tab menampilkan `InvoiceTab`, saat warga dibayar (via form pembayaran), daftar langsung terupdate dan warga tersebut hilang dari list tagihan

### Task 5: Penyesuaian Styling CSS
- **task_id**: `TASK-05-STYLING`
- **name**: Menambahkan kelas CSS pelengkap untuk invoice card, badge overdue, status pending, dan tombol aksi
- **agent**: `frontend-specialist`
- **skills**: `frontend-design`
- **priority**: P2
- **dependencies**: `TASK-04-INTEGRATE-ADMIN-PANEL`
- **INPUT**: `src/modules/internet/index.css`
- **OUTPUT**: Styling modern, clean, dan responsif
- **VERIFY**: Tampilan konsisten dalam mode gelap & terang (Dark Mode / Light Mode)

---

## Phase X: Verification Checklist
- [x] Tab "Invoice Tagihan" muncul di sidebar Admin Panel
- [x] Hanya warga yang belum bayar (`!r.isPaid`) yang tampil di tabel invoice
- [x] Akumulasi tunggakan terhitung akurat sesuai riwayat bulan sebelumnya
- [x] Status badge tanggal > 5 menampilkan indikator "TERLEWAT JATUH TEMPO"
- [x] Nomor rekening bank sesuai per blok (Blok A: BSI, Blok B: Mandiri)
- [x] Tombol Download PDF menghasilkan berkas PDF invoice yang rapi dan proporsional
- [x] Tombol Download PNG menghasilkan gambar berkualitas tinggi
- [x] Tombol "Bayar Sekarang" mengarahkan ke form pembayaran
- [x] Setelah pembayaran disimpan, warga langsung hilang dari menu invoice
- [x] Lint & build check (`npm run build` sukses tanpa error)
