<template>
  <div class="payments-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <div>
        <h2 class="text-h4 font-weight-bold">Quản Lý Thanh Toán</h2>
        <p class="text-body-2" style="color:#64748b">Theo dõi và xử lý hóa đơn học phí</p>
      </div>
      <div class="header-actions">
        <v-btn color="success" variant="flat" prepend-icon="mdi-plus" @click="openCreateDialog">
          <v-icon start>mdi-plus-circle</v-icon>
          Tạo Hóa Đơn
        </v-btn>
      </div>
    </div>

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col v-for="(kpi, index) in kpis" :key="kpi.label" cols="12" sm="6" lg="3">
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

    <!-- Filter & Search -->
    <v-card class="mb-6" rounded="xl">
      <div class="d-flex flex-wrap align-center pa-5 gap-4">
        <v-text-field 
          v-model="search" 
          prepend-inner-icon="mdi-magnify" 
          placeholder="Tìm học viên, khóa học..." 
          hide-details 
          density="compact" 
          style="max-width:280px"
          clearable 
          rounded="lg"
          variant="outlined"
          color="success"
        />
        <v-select 
          v-model="statusFilter" 
          :items="statusOptions" 
          label="Trạng thái" 
          density="compact" 
          hide-details 
          style="max-width:160px"
          variant="outlined"
          rounded="lg"
          color="success"
        />
        <v-spacer />
        <div class="stats-chip">
          <v-chip color="success" variant="tonal" size="small">
            <v-icon start size="14">mdi-check-circle</v-icon>
            {{ paidCount }} Đã TT
          </v-chip>
          <v-chip color="error" variant="tonal" size="small" class="ml-2">
            <v-icon start size="14">mdi-alert-circle</v-icon>
            {{ unpaidCount }} Chưa TT
          </v-chip>
        </div>
      </div>
    </v-card>

    <!-- Payments Table -->
    <v-card class="table-card" rounded="xl">
      <v-data-table 
        :headers="headers" 
        :items="filteredPayments" 
        :items-per-page="10" 
        hover
        class="custom-table"
        :loading="loading"
        loading-text="Đang tải dữ liệu..."
      >
        <template #item.studentName="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="36" color="success" variant="tonal" class="mr-3">
              <span class="text-subtitle-2 font-weight-bold">{{ getInitials(item.studentName) }}</span>
            </v-avatar>
            <div>
              <span class="font-weight-medium text-body-2">{{ item.studentName }}</span>
              <br>
              <span class="text-caption" style="color:#64748b">ID: {{ item.studentId }}</span>
            </div>
          </div>
        </template>
        
        <template #item.courseName="{ item }">
          <div>
            <span class="text-body-2">{{ item.courseName || '—' }}</span>
            <br>
            <span class="text-caption" style="color:#64748b">Khóa #{{ item.courseId }}</span>
          </div>
        </template>
        
        <template #item.amount="{ item }">
          <span class="font-weight-medium">{{ fmt(item.amount) }}</span>
        </template>
        
        <template #item.paidAmount="{ item }">
          <span class="text-success font-weight-medium">{{ fmt(item.paidAmount || 0) }}</span>
        </template>
        
        <template #item.remaining="{ item }">
          <span class="text-error font-weight-medium">{{ fmt(item.amount - (item.paidAmount || 0)) }}</span>
        </template>
        
        <template #item.paymentDate="{ item }">
          <span class="text-body-2">{{ formatDate(item.paymentDate) }}</span>
        </template>
        
        <template #item.dueDate="{ item }">
          <v-chip 
            :color="getDueDateColor(item.dueDate, item.status)" 
            variant="tonal" 
            size="small" 
            label
          >
            <v-icon start size="14">{{ getDueDateIcon(item.dueDate, item.status) }}</v-icon>
            {{ formatDate(item.dueDate) }}
          </v-chip>
        </template>
        
        <template #item.status="{ item }">
          <v-chip 
            :color="getStatusColor(item.status)" 
            variant="flat" 
            size="small" 
            label
            class="font-weight-medium status-chip"
          >
            <v-icon start size="14">{{ getStatusIcon(item.status) }}</v-icon>
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>
        
        <template #item.actions="{ item }">
          <v-btn 
            v-if="item.status !== 'Paid'"
            size="small" 
            variant="tonal" 
            color="success" 
            class="mr-2 action-btn"
            @click="openPayDialog(item)"
          >
            <v-icon start size="16">mdi-cash</v-icon>
            Thanh toán
          </v-btn>
          <v-btn 
            size="small" 
            variant="tonal" 
            color="primary"
            class="mr-2 action-btn"
            @click="openEditDialog(item)"
          >
            <v-icon start size="16">mdi-pencil</v-icon>
            Sửa
          </v-btn>
          <v-btn 
            size="small" 
            variant="tonal" 
            color="error"
            class="action-btn"
            @click="confirmDelete(item)"
          >
            <v-icon start size="16">mdi-delete</v-icon>
            Xóa
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-3 d-flex align-center">
          <v-avatar color="success" variant="tonal" size="44" class="mr-3">
            <v-icon color="success">{{ isEditMode ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          </v-avatar>
          <div>
            <span class="text-h6 font-weight-bold">{{ isEditMode ? 'Sửa Hóa Đơn' : 'Tạo Hóa Đơn Mới' }}</span>
            <br>
            <span class="text-caption" style="color:#64748b">{{ isEditMode ? 'Cập nhật thông tin hóa đơn' : 'Nhập thông tin hóa đơn mới' }}</span>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="showEditDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="6">
                <v-text-field 
                  v-model="formData.studentId" 
                  label="Mã học viên" 
                  type="number"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                  :rules="[v => !!v || 'Bắt buộc']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field 
                  v-model="formData.courseId" 
                  label="Mã khóa học" 
                  type="number"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                  :rules="[v => !!v || 'Bắt buộc']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="formData.studentName" 
                  label="Tên học viên"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="formData.courseName" 
                  label="Tên khóa học"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field 
                  v-model.number="formData.amount" 
                  label="Số tiền (VNĐ)"
                  type="number"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                  :prefix="'₫'"
                  :rules="[v => v > 0 || 'Phải lớn hơn 0']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field 
                  v-model="formData.dueDate" 
                  label="Ngày đến hạn"
                  type="date"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                />
              </v-col>
              <v-col cols="12" v-if="isEditMode">
                <v-textarea 
                  v-model="formData.note" 
                  label="Ghi chú"
                  rows="2"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  color="success"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5 pt-3">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="showEditDialog = false">
            Hủy bỏ
          </v-btn>
          <v-btn color="success" variant="flat" rounded="lg" prepend-icon="mdi-check" @click="savePayment" :loading="saving">
            {{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Pay Dialog -->
    <v-dialog v-model="showPayDialog" max-width="480" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-3 d-flex align-center">
          <v-avatar color="success" variant="tonal" size="44" class="mr-3">
            <v-icon color="success">mdi-cash</v-icon>
          </v-avatar>
          <div>
            <span class="text-h6 font-weight-bold">Thanh Toán Hóa Đơn</span>
            <br>
            <span class="text-caption" style="color:#64748b">{{ selectedPayment?.studentName }}</span>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="showPayDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            <div class="d-flex justify-space-between">
              <span>Tổng tiền:</span>
              <strong>{{ fmt(selectedPayment?.amount || 0) }}</strong>
            </div>
            <div class="d-flex justify-space-between mt-1">
              <span>Đã thanh toán:</span>
              <span class="text-success">{{ fmt(selectedPayment?.paidAmount || 0) }}</span>
            </div>
            <v-divider class="my-2" />
            <div class="d-flex justify-space-between">
              <span>Còn lại:</span>
              <strong class="text-error">{{ fmt((selectedPayment?.amount || 0) - (selectedPayment?.paidAmount || 0)) }}</strong>
            </div>
          </v-alert>
          
          <v-text-field 
            v-model.number="payAmount" 
            label="Số tiền thanh toán"
            type="number"
            density="compact"
            variant="outlined"
            rounded="lg"
            color="success"
            :prefix="'₫'"
            class="mb-4"
          />
          
          <v-select 
            v-model="payMethod" 
            :items="paymentMethods" 
            label="Phương thức"
            density="compact"
            variant="outlined"
            rounded="lg"
            color="success"
            class="mb-4"
          />
          
          <v-textarea 
            v-model="payNote" 
            label="Ghi chú (tùy chọn)"
            rows="2"
            density="compact"
            variant="outlined"
            rounded="lg"
            color="success"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5 pt-3">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="showPayDialog = false">
            Hủy bỏ
          </v-btn>
          <v-btn color="success" variant="flat" rounded="lg" prepend-icon="mdi-cash" @click="processPayment" :loading="paying">
            Xác nhận thanh toán
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-3">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          <span class="text-h6 font-weight-bold">Xác nhận xóa</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          Bạn có chắc muốn xóa hóa đơn của <strong>{{ selectedPayment?.studentName }}</strong> không? Hành động này không thể hoàn tác.
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5 pt-3">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="showDeleteDialog = false">
            Hủy bỏ
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" prepend-icon="mdi-delete" @click="confirmDeletePayment" :loading="deleting">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snack" :color="snackColor" rounded="lg" location="top" timeout="3000">
      <v-icon class="mr-2">{{ snackIcon }}</v-icon>
      {{ snackText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payment'
import { getPayments, createPayment, updatePayment, deletePayment, payInvoice } from '@/modules/payments/api/paymentApi'

const payment = usePaymentStore()
const search = ref('')
const statusFilter = ref('Tất cả')
const loading = computed(() => payment.loading)
const snack = ref(false)
const snackText = ref('')
const snackColor = ref('success')
const snackIcon = ref('mdi-check-circle')

// Dialog states
const showEditDialog = ref(false)
const showPayDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditMode = ref(false)
const selectedPayment = ref(null)
const saving = ref(false)
const paying = ref(false)
const deleting = ref(false)
const formValid = ref(false)
const formRef = ref(null)

// Form data
const formData = ref({
  studentId: null,
  courseId: null,
  studentName: '',
  courseName: '',
  amount: 0,
  dueDate: '',
  note: ''
})

// Pay form
const payAmount = ref(0)
const payMethod = ref('CASH')
const payNote = ref('')

const statusOptions = ['Tất cả', 'Paid', 'Partial', 'Unpaid']
const paymentMethods = ['CASH', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'CARD']

const headers = [
  { title: 'Học viên', key: 'studentName', minWidth: '200px' },
  { title: 'Khóa học', key: 'courseName', minWidth: '150px' },
  { title: 'Tổng tiền', key: 'amount', align: 'end', width: '130px' },
  { title: 'Đã TT', key: 'paidAmount', align: 'end', width: '120px' },
  { title: 'Còn lại', key: 'remaining', align: 'end', width: '120px' },
  { title: 'Ngày TT', key: 'paymentDate', align: 'center', width: '110px' },
  { title: 'Hạn', key: 'dueDate', align: 'center', width: '140px' },
  { title: 'Trạng thái', key: 'status', align: 'center', width: '120px' },
  { title: 'Thao tác', key: 'actions', width: '260px', sortable: false },
]

const fmt = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0)

const filteredPayments = computed(() => {
  let list = payment.invoices
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => 
      p.studentName?.toLowerCase().includes(q) || 
      p.courseName?.toLowerCase().includes(q) ||
      p.studentId?.toString().includes(q)
    )
  }
  if (statusFilter.value !== 'Tất cả') {
    list = list.filter(p => p.status === statusFilter.value)
  }
  return list
})

const paidCount = computed(() => payment.invoices.filter(p => p.status === 'Paid').length)
const unpaidCount = computed(() => payment.invoices.filter(p => p.status !== 'Paid').length)

const kpis = computed(() => [
  { 
    label: 'Tổng hóa đơn', 
    value: payment.invoices.length, 
    icon: 'mdi-receipt', 
    color: '#2E7D32', 
    bgColor: 'success',
    gradient: 'linear-gradient(135deg, rgba(46,125,50,0.3), transparent)',
  },
  { 
    label: 'Đã thanh toán', 
    value: paidCount.value, 
    icon: 'mdi-check-circle', 
    color: '#1976D2', 
    bgColor: 'primary',
    gradient: 'linear-gradient(135deg, rgba(25,118,210,0.3), transparent)',
  },
  { 
    label: 'Còn nợ', 
    value: unpaidCount.value, 
    icon: 'mdi-alert-circle', 
    color: '#E65100', 
    bgColor: 'warning',
    gradient: 'linear-gradient(135deg, rgba(230,81,0,0.3), transparent)',
  },
  { 
    label: 'Tổng thu', 
    value: fmt(payment.invoices.reduce((s, p) => s + (p.paidAmount || 0), 0)), 
    icon: 'mdi-cash-multiple', 
    color: '#7B1FA2', 
    bgColor: 'secondary',
    gradient: 'linear-gradient(135deg, rgba(123,31,162,0.3), transparent)',
  },
])

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

function getStatusColor(s) { 
  return { Paid: 'success', Partial: 'warning', Unpaid: 'error' }[s] || 'secondary' 
}

function getStatusIcon(s) { 
  return { Paid: 'mdi-check-circle', Partial: 'mdi-circle-half-full', Unpaid: 'mdi-alert-circle' }[s] || 'mdi-help-circle' 
}

function getStatusText(s) { 
  return { Paid: 'Đã TT', Partial: 'Một phần', Unpaid: 'Chưa TT' }[s] || s 
}

function getDueDateColor(dueDate, status) {
  if (status === 'Paid') return 'success'
  if (!dueDate) return 'grey'
  const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'error'
  if (daysLeft <= 7) return 'warning'
  return 'success'
}

function getDueDateIcon(dueDate, status) {
  if (status === 'Paid') return 'mdi-check-circle'
  if (!dueDate) return 'mdi-calendar'
  const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'mdi-alert-circle'
  if (daysLeft <= 7) return 'mdi-clock-alert'
  return 'mdi-calendar-check'
}

function openCreateDialog() {
  isEditMode.value = false
  formData.value = {
    studentId: null,
    courseId: null,
    studentName: '',
    courseName: '',
    amount: 0,
    dueDate: '',
    note: ''
  }
  showEditDialog.value = true
}

function openEditDialog(item) {
  isEditMode.value = true
  selectedPayment.value = item
  formData.value = {
    studentId: item.studentId,
    courseId: item.courseId,
    studentName: item.studentName || '',
    courseName: item.courseName || '',
    amount: item.amount,
    dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
    note: item.note || ''
  }
  showEditDialog.value = true
}

function openPayDialog(item) {
  selectedPayment.value = item
  payAmount.value = item.amount - (item.paidAmount || 0)
  payMethod.value = 'CASH'
  payNote.value = ''
  showPayDialog.value = true
}

async function savePayment() {
  if (!formValid.value) return
  saving.value = true
  try {
    if (isEditMode.value) {
      await updatePayment(selectedPayment.value.id, {
        amount: formData.value.amount,
        dueDate: formData.value.dueDate,
        note: formData.value.note
      })
      showSnack('Cập nhật hóa đơn thành công', 'success', 'mdi-check-circle')
    } else {
      await createPayment({
        studentId: formData.value.studentId,
        courseId: formData.value.courseId,
        amount: formData.value.amount,
        dueDate: formData.value.dueDate,
        note: formData.value.note
      })
      showSnack('Tạo hóa đơn thành công', 'success', 'mdi-check-circle')
    }
    showEditDialog.value = false
    await payment.fetchInvoices()
  } catch (e) {
    showSnack('Có lỗi xảy ra: ' + (e.message || 'Không xác định'), 'error', 'mdi-alert-circle')
  }
  saving.value = false
}

async function processPayment() {
  if (payAmount.value <= 0) {
    showSnack('Số tiền phải lớn hơn 0', 'error', 'mdi-alert-circle')
    return
  }
  paying.value = true
  try {
    await payInvoice(selectedPayment.value.id, {
      paidAmount: payAmount.value,
      paymentMethod: payMethod.value,
      note: payNote.value
    })
    showPayDialog.value = false
    showSnack('Thanh toán thành công!', 'success', 'mdi-check-circle')
    await payment.fetchInvoices()
  } catch (e) {
    showSnack('Có lỗi xảy ra: ' + (e.message || 'Không xác định'), 'error', 'mdi-alert-circle')
  }
  paying.value = false
}

function confirmDelete(item) {
  selectedPayment.value = item
  showDeleteDialog.value = true
}

async function confirmDeletePayment() {
  deleting.value = true
  try {
    await deletePayment(selectedPayment.value.id)
    showDeleteDialog.value = false
    showSnack('Xóa hóa đơn thành công', 'success', 'mdi-check-circle')
    await payment.fetchInvoices()
  } catch (e) {
    showSnack('Có lỗi xảy ra: ' + (e.message || 'Không xác định'), 'error', 'mdi-alert-circle')
  }
  deleting.value = false
}

function showSnack(text, color, icon) {
  snackText.value = text
  snackColor.value = color
  snackIcon.value = icon
  snack.value = true
}

onMounted(() => payment.fetchInvoices())
</script>

<style scoped>
.payments-page {
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
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* KPI Cards */
.kpi-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out backwards;
  border: 1px solid rgba(0,0,0,0.05);
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
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

.stats-chip {
  display: flex;
  gap: 8px;
}

/* Table */
.table-card {
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

.custom-table :deep(th) {
  background: #f8f9fa !important;
  font-weight: 600 !important;
  color: #2E7D32 !important;
  white-space: nowrap;
}

.custom-table :deep(tr:hover) {
  background: rgba(46, 125, 50, 0.04) !important;
}

.status-chip {
  font-weight: 500;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
}
</style>
