<script setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import {
  createAttendance,
  deleteAttendance,
  extractApiErrorMessage,
  getAttendances,
  updateAttendance,
} from '../api/studentApi'
import { useStudentDirectory } from '../composables/useStudentDirectory'
import {
  attendanceStateColor,
  attendanceStateLabel,
  formatDate,
  toDateValue,
} from '../utils/studentUi'

function createAttendanceForm() {
  return {
    studentId: undefined,
    scheduleId: undefined,
    date: toDateValue(new Date()),
    isPresent: true,
    note: '',
  }
}

const formRef = ref()
const attendances = ref([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingId = ref(null)
const searchText = ref('')

const formState = reactive(createAttendanceForm())

const { getStudentName, loadStudents, studentLoading, studentOptions } = useStudentDirectory()

const rules = {
  studentId: [{ required: true, message: 'Vui lòng chọn học viên.', trigger: 'change' }],
  scheduleId: [{ required: true, message: 'Vui lòng nhập ScheduleId.', trigger: 'blur' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày điểm danh.', trigger: 'change' }],
}

const columns = [
  { title: 'Học viên', key: 'student', width: 260, ellipsis: true },
  { title: 'Schedule ID', key: 'scheduleId', width: 120 },
  { title: 'Ngày', key: 'date', width: 120 },
  { title: 'Kết quả', key: 'state', width: 120 },
  { title: 'Ghi chú', key: 'note', ellipsis: true },
  { title: 'Thao tác', key: 'actions', width: 160, fixed: 'right' },
]

const filteredAttendances = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  const source = [...attendances.value].sort((left, right) => right.id - left.id)

  if (!keyword) {
    return source
  }

  return source.filter((attendance) => {
    const haystack = [
      getStudentName(attendance.studentId),
      attendance.scheduleId,
      attendance.note,
      attendance.isPresent ? 'present' : 'absent',
    ]
      .map((value) => String(value ?? '').toLowerCase())
      .join(' ')

    return haystack.includes(keyword)
  })
})

const totalAttendances = computed(() => attendances.value.length)
const presentCount = computed(
  () => attendances.value.filter((attendance) => attendance.isPresent).length,
)
const absentCount = computed(
  () => attendances.value.filter((attendance) => !attendance.isPresent).length,
)
const attendanceRate = computed(() => {
  if (!totalAttendances.value) {
    return 0
  }

  return Math.round((presentCount.value / totalAttendances.value) * 100)
})

const modalTitle = computed(() => (editingId.value ? 'Cập nhật điểm danh' : 'Thêm điểm danh'))

function resetForm() {
  Object.assign(formState, createAttendanceForm())
}

function openCreateModal() {
  editingId.value = null
  resetForm()
  modalOpen.value = true
}

function openEditModal(record) {
  editingId.value = record.id
  Object.assign(formState, {
    studentId: record.studentId,
    scheduleId: record.scheduleId,
    date: toDateValue(record.date),
    isPresent: Boolean(record.isPresent),
    note: record.note ?? '',
  })
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  resetForm()
  formRef.value?.clearValidate?.()
}

async function loadAttendances() {
  loading.value = true
  try {
    attendances.value = await getAttendances()
  } catch (error) {
    message.error(extractApiErrorMessage(error, 'Không tải được danh sách điểm danh.'))
  } finally {
    loading.value = false
  }
}

async function reloadAll() {
  await Promise.all([loadStudents(), loadAttendances()])
}

async function submitForm() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const payload = {
    studentId: Number(formState.studentId),
    scheduleId: Number(formState.scheduleId),
    date: formState.date ? `${formState.date}T00:00:00` : null,
    isPresent: Boolean(formState.isPresent),
    note: formState.note?.trim() || null,
  }

  saving.value = true
  try {
    if (editingId.value) {
      await updateAttendance(editingId.value, payload)
      message.success('Đã cập nhật điểm danh.')
    } else {
      await createAttendance(payload)
      message.success('Đã thêm điểm danh.')
    }

    closeModal()
    await loadAttendances()
  } catch (error) {
    message.error(
      extractApiErrorMessage(
        error,
        editingId.value ? 'Không cập nhật được điểm danh.' : 'Không tạo được điểm danh.',
      ),
    )
  } finally {
    saving.value = false
  }
}

async function handleDelete(record) {
  try {
    await deleteAttendance(record.id)
    message.success('Đã xoá điểm danh.')
    await loadAttendances()
  } catch (error) {
    message.error(extractApiErrorMessage(error, 'Không xoá được điểm danh.'))
  }
}

onMounted(reloadAll)
</script>

<template>
  <section class="student-module">
    <a-card class="module-hero" :bordered="false">
      <div class="module-hero__body">
        <p class="eyebrow">Student & Attendance Service</p>
        <h2>Attendances</h2>
        <p>
          Quản lý điểm danh cho từng buổi học. Màn hình này lưu StudentId và ScheduleId, không
          tham chiếu sang database service khác.
        </p>
      </div>

      <div class="module-hero__actions">
        <a-button
          :icon="h(ReloadOutlined)"
          :loading="loading || studentLoading"
          @click="reloadAll"
        >
          Tải lại
        </a-button>
        <a-button type="primary" :icon="h(PlusOutlined)" @click="openCreateModal">
          Thêm điểm danh
        </a-button>
      </div>
    </a-card>

    <div class="module-metrics">
      <a-card class="module-metric-card" :bordered="false">
        <div class="module-metric-label">Tổng điểm danh</div>
        <div class="module-metric-value">{{ totalAttendances }}</div>
        <div class="module-metric-footnote">Toàn bộ bản ghi</div>
      </a-card>
      <a-card class="module-metric-card" :bordered="false">
        <div class="module-metric-label">Có mặt</div>
        <div class="module-metric-value">{{ presentCount }}</div>
        <div class="module-metric-footnote">IsPresent = true</div>
      </a-card>
      <a-card class="module-metric-card" :bordered="false">
        <div class="module-metric-label">Vắng mặt</div>
        <div class="module-metric-value">{{ absentCount }}</div>
        <div class="module-metric-footnote">IsPresent = false</div>
      </a-card>
      <a-card class="module-metric-card" :bordered="false">
        <div class="module-metric-label">Tỉ lệ đi học</div>
        <div class="module-metric-value">{{ attendanceRate }}%</div>
        <div class="module-metric-footnote">Có mặt / tổng số</div>
      </a-card>
    </div>

    <a-card class="module-table-card" :bordered="false">
      <div class="module-toolbar">
        <a-input-search
          v-model:value="searchText"
          class="module-search"
          placeholder="Tìm theo tên học viên, ScheduleId hoặc ghi chú..."
          :prefix="h(SearchOutlined)"
          allow-clear
        />
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredAttendances"
        :loading="loading || studentLoading"
        :pagination="{ pageSize: 6, showSizeChanger: false, hideOnSinglePage: true }"
        :scroll="{ x: 980 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'student'">
            <div class="entity-cell">
              <a-avatar :style="{ backgroundColor: '#14b8a6' }">
                <CheckSquareOutlined />
              </a-avatar>
              <div class="entity-cell__meta">
                <strong>{{ getStudentName(record.studentId) }}</strong>
                <span>StudentId #{{ record.studentId }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'scheduleId'">
            <a-tag color="cyan">Schedule #{{ record.scheduleId }}</a-tag>
          </template>

          <template v-else-if="column.key === 'date'">
            {{ formatDate(record.date) }}
          </template>

          <template v-else-if="column.key === 'state'">
            <a-tag :color="attendanceStateColor(record.isPresent)">
              {{ attendanceStateLabel(record.isPresent) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'note'">
            <span class="entity-note">{{ record.note || 'Không có ghi chú' }}</span>
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="entity-actions">
              <a-button type="link" @click="openEditModal(record)">
                <EditOutlined />
                Sửa
              </a-button>
              <a-popconfirm
                title="Xoá điểm danh này?"
                ok-text="Xoá"
                cancel-text="Huỷ"
                @confirm="() => handleDelete(record)"
              >
                <a-button type="link" danger>
                  <DeleteOutlined />
                  Xoá
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      :confirm-loading="saving"
      cancel-text="Huỷ"
      ok-text="Lưu"
      destroy-on-close
      width="760px"
      @ok="submitForm"
      @cancel="closeModal"
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :xs="24" :md="12">
            <a-form-item label="Học viên" name="studentId">
              <a-select
                v-model:value="formState.studentId"
                :options="studentOptions"
                placeholder="Chọn học viên"
                show-search
                option-filter-prop="label"
              />
              <div class="form-hint">Lấy tên học viên từ Student Service.</div>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="ScheduleId" name="scheduleId">
              <a-input-number
                v-model:value="formState.scheduleId"
                :min="1"
                style="width: 100%"
                placeholder="201"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="Ngày điểm danh" name="date">
              <a-date-picker
                v-model:value="formState.date"
                style="width: 100%"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                placeholder="Chọn ngày"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="Có mặt">
              <a-switch v-model:checked="formState.isPresent" />
              <div class="form-hint">
                Bật nếu học viên có mặt, tắt nếu vắng mặt.
              </div>
            </a-form-item>
          </a-col>
          <a-col :xs="24">
            <a-form-item label="Ghi chú">
              <a-textarea
                v-model:value="formState.note"
                :rows="3"
                placeholder="Ví dụ: đi trễ 5 phút, xin phép nghỉ..."
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </section>
</template>
