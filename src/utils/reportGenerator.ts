import { Project, DailyReport, Invoice, Payment, Expense, Worker, Task } from '../types/domain'

export interface ReportData {
  project: Project
  reports: DailyReport[]
  invoices: Invoice[]
  payments: Payment[]
  expenses: Expense[]
  workers: Worker[]
  tasks: Task[]
}

export function generateDailyReportHTML(data: ReportData, startDate?: string, endDate?: string): string {
  const dateNow = new Date().toLocaleDateString('ar-EG')
  const currentReport = data.reports[data.reports.length - 1]

  const filteredReports = data.reports.filter((r) => {
    if (!startDate || !endDate) return true
    const rDate = new Date(r.date).toISOString().split('T')[0]
    return rDate >= startDate && rDate <= endDate
  })

  const filteredInvoices = data.invoices.filter((inv) => {
    if (!startDate || !endDate) return true
    return inv.date >= startDate && inv.date <= endDate
  })

  const filteredPayments = data.payments.filter((p) => {
    if (!startDate || !endDate) return true
    return p.date >= startDate && p.date <= endDate
  })

  const filteredExpenses = data.expenses.filter((e) => {
    if (!startDate || !endDate) return true
    return e.date >= startDate && e.date <= endDate
  })

  const totalInvoices = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPayments = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير يومي - ${data.project.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1f2937;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            color: #6b7280;
            font-size: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border-right: 4px solid #3b82f6;
        }
        .info-box label {
            display: block;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        .info-box .value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table thead {
            background-color: #f3f4f6;
        }
        table th {
            padding: 10px;
            text-align: right;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #f3f4f6;
        }
        table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .print-only {
            display: none;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .print-only {
                display: block;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.project.title}</h1>
            <p>تقرير يومي - ${dateNow}</p>
            <p>البيان المالي والتقني</p>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <label>اسم العميل</label>
                <div class="value">${data.project.client || 'غير محدد'}</div>
            </div>
            <div class="info-box">
                <label>الموقع</label>
                <div class="value">${data.project.location || 'غير محدد'}</div>
            </div>
            <div class="info-box">
                <label>آخر نسبة إنجاز</label>
                <div class="value">${currentReport ? currentReport.progressPercent + '%' : '--'}</div>
            </div>
            <div class="info-box">
                <label>عدد العمال</label>
                <div class="value">${currentReport?.workersCount || data.workers.length}</div>
            </div>
        </div>

        ${
          filteredReports.length > 0
            ? `
        <div class="section">
            <div class="section-title">التقارير اليومية</div>
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>الإنجاز</th>
                        <th>عدد العمال</th>
                        <th>الملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredReports
                      .map(
                        (r) => `
                    <tr>
                        <td>${new Date(r.date).toLocaleDateString('ar-EG')}</td>
                        <td>${r.progressPercent}%</td>
                        <td>${r.workersCount || '-'}</td>
                        <td>${r.notes || '-'}</td>
                    </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }

        <div class="section">
            <div class="section-title">الملخص المالي</div>
            <table>
                <thead>
                    <tr>
                        <th>البند</th>
                        <th>المبلغ (ليرة سورية)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>إجمالي الفواتير</td>
                        <td class="text-right">${totalInvoices.toLocaleString('ar-EG')}</td>
                    </tr>
                    <tr>
                        <td>إجمالي الدفعات المستلمة</td>
                        <td class="text-right">${totalPayments.toLocaleString('ar-EG')}</td>
                    </tr>
                    <tr>
                        <td>المتبقي على العميل</td>
                        <td class="text-right">${(totalInvoices - totalPayments).toLocaleString('ar-EG')}</td>
                    </tr>
                    <tr style="background-color: #fef3c7; font-weight: bold;">
                        <td>إجمالي المصاريف</td>
                        <td class="text-right">${totalExpenses.toLocaleString('ar-EG')}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${
          filteredInvoices.length > 0
            ? `
        <div class="section">
            <div class="section-title">الفواتير</div>
            <table>
                <thead>
                    <tr>
                        <th>رقم الفاتورة</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredInvoices
                      .map(
                        (inv) => `
                    <tr>
                        <td>${inv.number}</td>
                        <td>${new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                        <td class="text-right">${inv.total.toLocaleString('ar-EG')} ليرة سورية</td>
                    </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }

        ${
          filteredExpenses.length > 0
            ? `
        <div class="section">
            <div class="section-title">المصاريف</div>
            <table>
                <thead>
                    <tr>
                        <th>الوصف</th>
                        <th>النوع</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredExpenses
                      .map(
                        (e) => `
                    <tr>
                        <td>${e.label}</td>
                        <td>${
                          e.category === 'materials'
                            ? 'مواد'
                            : e.category === 'equipment'
                              ? 'معدات'
                              : e.category === 'fuel'
                                ? 'محروقات'
                                : e.category === 'food'
                                  ? 'طعام'
                                  : e.category === 'worker_daily'
                                    ? 'يومية عمال'
                                    : 'أخرى'
                        }</td>
                        <td>${new Date(e.date).toLocaleDateString('ar-EG')}</td>
                        <td class="text-right">${e.amount.toLocaleString('ar-EG')} ليرة سورية</td>
                    </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        `
            : ''
        }

        <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة تطبيق إدارة المقاولات</p>
            <p>${dateNow}</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            // يمكن تفعيل الطباعة تلقائياً إذا أردت
            // window.print();
        }
    </script>
</body>
</html>
  `

  return html
}

export function downloadReportAsHTML(html: string, projectName: string) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html))
  element.setAttribute('download', `${projectName}-تقرير-${new Date().toISOString().split('T')[0]}.html`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export function openReportInWindow(html: string) {
  const printWindow = window.open('', '', 'height=600,width=900')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
