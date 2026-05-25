<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h2 class="text-h4 font-weight-bold">Báo Cáo & Thống Kê</h2>
        <p class="text-body-2" style="color:#64748b">Theo dõi doanh thu, phân tích tài chính</p>
      </div>
      <div class="header-actions">
        <v-btn-toggle v-model="activeTab" mandatory density="compact" rounded="lg" color="success">
          <v-btn value="overview" size="small">
            <v-icon start size="18">mdi-chart-bar</v-icon>
            Tổng Quan
          </v-btn>
          <v-btn value="revenue" size="small">
            <v-icon start size="18">mdi-cash-multiple</v-icon>
            Doanh Thu
          </v-btn>
          <v-btn value="course" size="small">
            <v-icon start size="18">mdi-book-education</v-icon>
            Theo Khóa
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- Tab: Overview -->
    <div v-if="activeTab === 'overview'">
      <!-- KPI Summary -->
      <v-row class="mb-6">
        <v-col v-for="(kpi, index) in overviewKpis" :key="kpi.label" cols="12" sm="6" lg="3">
          <v-card class="kpi-card" :style="{ animationDelay: index * 0.1 + 's' }" rounded="xl">
            <div class="kpi-glow" :style="{ background: kpi.gradient }"></div>
            <div class="d-flex align-center justify-space-between pa-4">
              <div>
                <p class="text-caption mb-1 kpi-label">{{ kpi.label }}</p>
                <h3 class="text-h5 font-weight-bold" :style="{ color: kpi.color }">{{ kpi.value }}</h3>
              </div>
              <v-avatar size="50" :color="kpi.bgColor" variant="tonal" rounded="xl">
                <v-icon :color="kpi.color" size="24">{{ kpi.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Revenue Chart + Category -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card class="chart-card pa-5" rounded="xl">
            <div class="d-flex align-center mb-4">
              <div>
                <span class="text-subtitle-1 font-weight-bold">Doanh Thu 6 Tháng</span>
                <p class="text-caption" style="color:#64748b">So sánh thực tế vs mục tiêu</p>
              </div>
              <v-spacer />
              <v-select 
                v-model="selectedYear" 
                :items="yearOptions" 
                density="compact" 
                variant="outlined"
                rounded="lg"
                color="success"
                hide-details
                style="max-width:120px"
              />
            </div>
            <div class="chart-container">
              <canvas ref="revenueChartRef"></canvas>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card class="chart-card pa-5 h-100" rounded="xl">
            <span class="text-subtitle-1 font-weight-bold d-block mb-1">Phân Bổ Theo Loại</span>
            <p class="text-caption mb-4" style="color:#64748b">Doanh thu theo khóa học</p>
            <div class="chart-container-doughnut">
              <canvas ref="categoryChartRef"></canvas>
            </div>
            <div class="chart-legend mt-4">
              <div v-for="(item, i) in categoryLegend" :key="i" class="legend-item">
                <div class="legend-color" :style="{ background: item.color }"></div>
                <span class="text-caption">{{ item.label }}</span>
                <span class="text-caption font-weight-bold ml-auto">{{ item.percent }}%</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-5" rounded="xl">
            <span class="text-subtitle-1 font-weight-bold d-block mb-3">Thanh Toán Gần Đây</span>
            <div v-for="item in recentPayments" :key="item.id" class="recent-item">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar size="36" :color="item.status === 'Paid' ? 'success' : 'warning'" variant="tonal" class="mr-3">
                    <v-icon size="18" :color="item.status === 'Paid' ? 'success' : 'warning'">
                      {{ item.status === 'Paid' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <span class="text-body-2 font-weight-medium">{{ item.studentName }}</span>
                    <br>
                    <span class="text-caption" style="color:#64748b">{{ item.courseName }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-body-2 font-weight-bold text-success">{{ fmt(item.paidAmount) }}</span>
                  <br>
                  <span class="text-caption" style="color:#64748b">{{ formatDate(item.paymentDate) }}</span>
                </div>
              </div>
              <v-divider class="mb-2" />
            </div>
            <div v-if="recentPayments.length === 0" class="text-center pa-4">
              <p class="text-caption" style="color:#64748b">Chưa có thanh toán nào</p>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-5" rounded="xl">
            <span class="text-subtitle-1 font-weight-bold d-block mb-3">Công Nợ Nổi Bật</span>
            <div v-for="item in topDebts" :key="item.id" class="recent-item">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-avatar size="36" color="error" variant="tonal" class="mr-3">
                    <span class="text-subtitle-2 font-weight-bold">{{ getInitials(item.studentName) }}</span>
                  </v-avatar>
                  <div>
                    <span class="text-body-2 font-weight-medium">{{ item.studentName }}</span>
                    <br>
                    <v-chip size="x-small" :color="item.status === 'Overdue' ? 'error' : 'warning'" variant="tonal" label>
                      {{ item.status === 'Overdue' ? 'Quá hạn' : 'Cảnh báo' }}
                    </v-chip>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-body-2 font-weight-bold text-error">{{ fmt(item.remainingAmount) }}</span>
                  <br>
                  <span class="text-caption" style="color:#64748b">{{ item.daysOverdue }} ngày quá hạn</span>
                </div>
              </div>
              <v-divider class="mb-2" />
            </div>
            <div v-if="topDebts.length === 0" class="text-center pa-4">
              <p class="text-caption" style="color:#64748b">Không có công nợ nào</p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Tab: Revenue -->
    <div v-if="activeTab === 'revenue'">
      <v-row class="mb-6">
        <v-col cols="12" sm="4">
          <v-card class="pa-4" rounded="xl">
            <div class="d-flex align-center">
              <div>
                <p class="text-caption mb-1" style="color:#64748b">Tổng Doanh Thu</p>
                <h3 class="text-h5 font-weight-bold text-success">{{ fmt(revenueTotal) }}</h3>
              </div>
              <v-spacer />
              <v-avatar size="44" color="success" variant="tonal" rounded="lg"><v-icon color="success">mdi-cash</v-icon></v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4" rounded="xl">
            <div class="d-flex align-center">
              <div>
                <p class="text-caption mb-1" style="color:#64748b">Số Giao Dịch</p>
                <h3 class="text-h5 font-weight-bold text-primary">{{ revenueByMonth.length }}</h3>
              </div>
              <v-spacer />
              <v-avatar size="44" color="primary" variant="tonal" rounded="lg"><v-icon color="primary">mdi-receipt</v-icon></v-avatar>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4" rounded="xl">
            <div class="d-flex align-center">
              <div>
                <p class="text-caption mb-1" style="color:#64748b">Trung Bình/Tháng</p>
                <h3 class="text-h5 font-weight-bold text-secondary">{{ fmt(revenueTotal / Math.max(revenueByMonth.length, 1)) }}</h3>
              </div>
              <v-spacer />
              <v-avatar size="44" color="secondary" variant="tonal" rounded="lg"><v-icon color="secondary">mdi-chart-line</v-icon></v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-6" rounded="xl">
        <div class="d-flex flex-wrap align-center pa-5 gap-4">
          <v-select 
            v-model="revenueYear" 
            :items="yearOptions" 
            label="Năm" 
            density="compact"
            variant="outlined"
            rounded="lg"
            color="success"
            style="max-width:150px"
          />
          <v-spacer />
          <v-btn color="success" variant="tonal" prepend-icon="mdi-microsoft-excel" size="small">
            <v-icon start size="18">mdi-microsoft-excel</v-icon>
            Xuất Excel
          </v-btn>
          <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" size="small">
            <v-icon start size="18">mdi-file-pdf-box</v-icon>
            Xuất PDF
          </v-btn>
        </div>
      </v-card>

      <v-card class="pa-5 mb-6" rounded="xl">
        <span class="text-subtitle-1 font-weight-bold d-block mb-4">Doanh Thu Theo Tháng - {{ revenueYear }}</span>
        <div class="chart-container" style="height:300px">
          <canvas ref="revenueMonthChartRef"></canvas>
        </div>
      </v-card>

      <v-card rounded="xl">
        <v-data-table 
          :headers="revenueHeaders" 
          :items="revenueByMonth" 
          :items-per-page="12"
          density="comfortable"
          class="custom-table"
        >
          <template #item.Revenue="{ item }">
            <span class="font-weight-bold text-success">{{ fmt(item.Revenue || 0) }}</span>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!-- Tab: By Course -->
    <div v-if="activeTab === 'course'">
      <v-row class="mb-6">
        <v-col v-for="(kpi, index) in courseKpis" :key="kpi.label" cols="12" sm="4">
          <v-card class="kpi-card" rounded="xl">
            <div class="d-flex align-center pa-4">
              <div>
                <p class="text-caption mb-1 kpi-label">{{ kpi.label }}</p>
                <h3 class="text-h5 font-weight-bold" :style="{ color: kpi.color }">{{ kpi.value }}</h3>
              </div>
              <v-spacer />
              <v-avatar size="48" :color="kpi.bgColor" variant="tonal" rounded="xl">
                <v-icon :color="kpi.color" size="24">{{ kpi.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-6" rounded="xl">
        <div class="pa-5">
          <div class="d-flex align-center mb-4">
            <span class="text-subtitle-1 font-weight-bold">Doanh Thu Theo Khóa Học</span>
            <v-spacer />
            <v-btn-toggle v-model="courseViewMode" mandatory density="compact" rounded="lg" color="success">
              <v-btn value="table" size="x-small"><v-icon size="18">mdi-table</v-icon></v-btn>
              <v-btn value="chart" size="x-small"><v-icon size="18">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          
          <div v-if="courseViewMode === 'table'">
            <v-data-table 
              :headers="courseHeaders" 
              :items="courseData" 
              :items-per-page="10"
              density="comfortable"
              class="custom-table"
              hover
            >
              <template #item.totalAmount="{ item }">
                <span class="font-weight-medium">{{ fmt(item.totalAmount) }}</span>
              </template>
              <template #item.paidAmount="{ item }">
                <span class="text-success font-weight-medium">{{ fmt(item.paidAmount) }}</span>
              </template>
              <template #item.unpaidAmount="{ item }">
                <span class="text-error">{{ fmt(item.unpaidAmount) }}</span>
              </template>
              <template #item.progress="{ item }">
                <div class="d-flex align-center gap-2">
                  <v-progress-linear 
                    :model-value="getPaymentProgress(item)" 
                    :color="getPaymentProgressColor(item)" 
                    height="8" 
                    rounded
                    style="max-width:100px"
                  />
                  <span class="text-caption">{{ getPaymentProgress(item) }}%</span>
                </div>
              </template>
            </v-data-table>
          </div>

          <div v-else style="height:400px">
            <canvas ref="courseChartRef"></canvas>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Loading -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="success" size="64"></v-progress-circular>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar v-model="snack" :color="snackColor" rounded="lg" location="top" timeout="3000">
      <v-icon class="mr-2">{{ snackIcon }}</v-icon>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { usePaymentStore } from '@/stores/payment'
import { getDashboard, getRevenueReport, getReportByCourse } from '@/modules/payments/api/paymentApi'

Chart.register(...registerables)

const payment = usePaymentStore()
const activeTab = ref('overview')
const loading = ref(false)
const snack = ref(false)
const snackText = ref('')
const snackColor = ref('success')
const snackIcon = ref('mdi-check-circle')

// Refs for charts
const revenueChartRef = ref(null)
const categoryChartRef = ref(null)
const revenueMonthChartRef = ref(null)
const courseChartRef = ref(null)

// Selections
const selectedYear = ref(2026)
const revenueYear = ref(2026)
const courseViewMode = ref('table')

const yearOptions = [2024, 2025, 2026]

const fmt = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0)

const revenueHeaders = [
  { title: 'Tháng', key: 'MonthLabel', align: 'start' },
  { title: 'Doanh Thu', key: 'Revenue', align: 'end' },
]

const courseHeaders = [
  { title: 'Khóa học', key: 'courseName', minWidth: '200px' },
  { title: 'Tổng tiền', key: 'totalAmount', align: 'end' },
  { title: 'Đã TT', key: 'paidAmount', align: 'end' },
  { title: 'Còn nợ', key: 'unpaidAmount', align: 'end' },
  { title: 'HV', key: 'studentCount', align: 'center', width: '80px' },
  { title: 'Tiến độ', key: 'progress', align: 'center', width: '150px' },
]

// Computed data from store
const recentPayments = computed(() => 
  payment.invoices.filter(i => i.status === 'Paid').slice(0, 5)
)

const topDebts = computed(() => 
  [...payment.debts].sort((a, b) => b.remainingAmount - a.remainingAmount).slice(0, 5)
)

const revenueByMonth = ref([])
const revenueTotal = computed(() => 
  revenueByMonth.value.reduce((s, m) => s + (m.Revenue || 0), 0)
)

const courseData = ref([])

const dashboardData = computed(() => payment.dashboard)

const overviewKpis = computed(() => {
  const d = dashboardData.value
  return [
    { 
      label: 'Doanh Thu Tháng', 
      value: fmt(d?.totalRevenue || 0), 
      icon: 'mdi-trending-up', 
      color: '#2E7D32', 
      bgColor: 'success',
      gradient: 'linear-gradient(135deg, rgba(46,125,50,0.3), transparent)',
    },
    { 
      label: 'Học Viên', 
      value: d?.totalStudents || 0, 
      icon: 'mdi-account-group', 
      color: '#1976D2', 
      bgColor: 'primary',
      gradient: 'linear-gradient(135deg, rgba(25,118,210,0.3), transparent)',
    },
    { 
      label: 'Tổng Công Nợ', 
      value: fmt(d?.totalDebt || 0), 
      icon: 'mdi-alert-circle', 
      color: '#E65100', 
      bgColor: 'warning',
      gradient: 'linear-gradient(135deg, rgba(230,81,0,0.3), transparent)',
    },
    { 
      label: 'Khóa Học Active', 
      value: d?.activeCourses || 0, 
      icon: 'mdi-book-open-variant', 
      color: '#7B1FA2', 
      bgColor: 'secondary',
      gradient: 'linear-gradient(135deg, rgba(123,31,162,0.3), transparent)',
    },
  ]
})

const categoryLegend = [
  { label: 'Tiếng Anh', percent: 45, color: '#2E7D32' },
  { label: 'Lập trình', percent: 25, color: '#1976D2' },
  { label: 'Marketing', percent: 12, color: '#E65100' },
  { label: 'Kế toán', percent: 10, color: '#7B1FA2' },
  { label: 'Thiết kế', percent: 8, color: '#00838F' },
]

const courseKpis = computed(() => [
  { label: 'Tổng Khóa Học', value: courseData.value.length, icon: 'mdi-book', color: '#2E7D32', bgColor: 'success' },
  { label: 'Tổng Doanh Thu', value: fmt(courseData.value.reduce((s, c) => s + (c.paidAmount || 0), 0)), icon: 'mdi-cash', color: '#1976D2', bgColor: 'primary' },
  { label: 'Tổng Học Viên', value: courseData.value.reduce((s, c) => s + (c.studentCount || 0), 0), icon: 'mdi-account-multiple', color: '#E65100', bgColor: 'warning' },
])

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function getPaymentProgress(item) {
  if (!item.totalAmount) return 0
  return Math.round((item.paidAmount / item.totalAmount) * 100)
}

function getPaymentProgressColor(item) {
  const p = getPaymentProgress(item)
  if (p >= 80) return 'success'
  if (p >= 50) return 'warning'
  return 'error'
}

let revenueChart = null
let categoryChart = null
let revenueMonthChart = null
let courseChart = null

function destroyChart(chart) {
  if (chart) { chart.destroy(); chart = null }
}

async function initOverviewCharts() {
  await nextTick()
  destroyChart(revenueChart)
  destroyChart(categoryChart)

  if (revenueChartRef.value) {
    revenueChart = new Chart(revenueChartRef.value, {
      type: 'bar',
      data: {
        labels: ['T12/2025', 'T1/2026', 'T2/2026', 'T3/2026', 'T4/2026', 'T5/2026'],
        datasets: [
          {
            label: 'Thực tế',
            data: [185, 245, 198, 312, 278, 295],
            backgroundColor: 'rgba(46, 125, 50, 0.8)',
            borderRadius: 8,
          },
          {
            label: 'Mục tiêu',
            data: [180, 220, 200, 280, 300, 290],
            backgroundColor: 'rgba(25, 118, 210, 0.5)',
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw} triệu`
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { callback: v => v + 'M' }
          }
        }
      }
    })
  }

  if (categoryChartRef.value) {
    categoryChart = new Chart(categoryChartRef.value, {
      type: 'doughnut',
      data: {
        labels: categoryLegend.map(l => l.label),
        datasets: [{
          data: categoryLegend.map(l => l.percent),
          backgroundColor: categoryLegend.map(l => l.color),
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } }
      }
    })
  }
}

async function initRevenueMonthChart() {
  await nextTick()
  destroyChart(revenueMonthChart)

  if (revenueMonthChartRef.value && revenueByMonth.value.length > 0) {
    revenueMonthChart = new Chart(revenueMonthChartRef.value, {
      type: 'line',
      data: {
        labels: revenueByMonth.value.map(m => m.MonthLabel),
        datasets: [{
          label: 'Doanh thu',
          data: revenueByMonth.value.map(m => (m.Revenue || 0) / 1000000),
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#2E7D32',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            ticks: { callback: v => v + 'M' }
          }
        }
      }
    })
  }
}

async function initCourseChart() {
  await nextTick()
  destroyChart(courseChart)

  if (courseChartRef.value && courseData.value.length > 0) {
    courseChart = new Chart(courseChartRef.value, {
      type: 'bar',
      data: {
        labels: courseData.value.map(c => c.courseName?.substring(0, 15) + (c.courseName?.length > 15 ? '...' : '')),
        datasets: [
          {
            label: 'Tổng',
            data: courseData.value.map(c => (c.totalAmount || 0) / 1000000),
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            borderRadius: 6,
          },
          {
            label: 'Đã TT',
            data: courseData.value.map(c => (c.paidAmount || 0) / 1000000),
            backgroundColor: 'rgba(46, 125, 50, 0.7)',
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { ticks: { callback: v => v + 'M' } }
        }
      }
    })
  }
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      payment.fetchDashboard(),
      payment.fetchInvoices(),
      payment.fetchDebts(),
    ])

    // Revenue by month
    try {
      const revData = await getRevenueReport({ year: revenueYear.value })
      if (revData?.byMonth) {
        revenueByMonth.value = revData.byMonth
      }
    } catch (e) { console.warn('Revenue report error:', e) }

    // Course data
    try {
      const courseRes = await getReportByCourse()
      if (Array.isArray(courseRes)) {
        courseData.value = courseRes
      }
    } catch (e) { console.warn('Course report error:', e) }

    await initOverviewCharts()
  } catch (e) {
    showSnack('Lỗi tải dữ liệu: ' + (e.message || ''), 'error', 'mdi-alert-circle')
  }
  loading.value = false
}

function showSnack(text, color, icon) {
  snackText.value = text
  snackColor.value = color
  snackIcon.value = icon
  snack.value = true
}

watch(activeTab, async (tab) => {
  if (tab === 'revenue') {
    await initRevenueMonthChart()
  } else if (tab === 'course') {
    await initCourseChart()
  }
})

onMounted(loadData)
</script>

<style scoped>
.reports-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.kpi-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
}

.kpi-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.kpi-label {
  color: #64748b !important;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px !important;
}

.chart-card {
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.06) !important;
}

.chart-container {
  height: 280px;
  position: relative;
}

.chart-container-doughnut {
  height: 180px;
  position: relative;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.recent-item:last-child .v-divider {
  display: none;
}

.custom-table :deep(th) {
  background: #f8f9fa !important;
  font-weight: 600 !important;
  color: #2E7D32 !important;
}

.custom-table :deep(tr:hover) {
  background: rgba(46, 125, 50, 0.04) !important;
}
</style>
