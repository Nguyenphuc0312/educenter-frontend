<script setup>
import { computed, ref } from 'vue'
import HomeView from './views/HomeView.vue'
import CoursesPage from './modules/courses/pages/CoursesPage.vue'
import SchedulesPage from './modules/courses/pages/SchedulesPage.vue'
import StudentsPage from './modules/students/pages/StudentsPage.vue'
import EnrollmentsPage from './modules/students/pages/EnrollmentsPage.vue'
import AttendancesPage from './modules/students/pages/AttendancesPage.vue'
import ResultsPage from './modules/students/pages/ResultsPage.vue'
import PaymentsPage from './modules/payments/pages/PaymentsPage.vue'
import ReportsPage from './modules/payments/pages/ReportsPage.vue'

const menuItems = [
  { key: 'home', label: 'Home', group: 'System' },
  { key: 'courses', label: 'Courses', group: 'Course & Schedule' },
  { key: 'schedules', label: 'Schedules', group: 'Course & Schedule' },
  { key: 'students', label: 'Students', group: 'Student, Attendance & Results' },
  { key: 'enrollments', label: 'Enrollments', group: 'Student, Attendance & Results' },
  { key: 'attendances', label: 'Attendances', group: 'Student, Attendance & Results' },
  { key: 'results', label: 'Results', group: 'Student, Attendance & Results' },
  { key: 'payments', label: 'Payments', group: 'Payment & Report' },
  { key: 'reports', label: 'Reports', group: 'Payment & Report' },
]

const pages = {
  home: HomeView,
  courses: CoursesPage,
  schedules: SchedulesPage,
  students: StudentsPage,
  enrollments: EnrollmentsPage,
  attendances: AttendancesPage,
  results: ResultsPage,
  payments: PaymentsPage,
  reports: ReportsPage,
}

const activePage = ref('home')
const ActiveComponent = computed(() => pages[activePage.value] ?? HomeView)
</script>

<template>
  <a-layout class="app-shell">
    <a-layout-sider
      class="app-sidebar"
      width="272"
      breakpoint="lg"
      collapsed-width="0"
    >
      <div class="brand">
        <div class="brand-mark">FS</div>
        <div>
          <strong>Training Center</strong>
          <span>Microservices Demo</span>
        </div>
      </div>

      <a-menu
        class="sidebar-menu"
        mode="inline"
        :selected-keys="[activePage]"
        @click="({ key }) => (activePage = key)"
      >
        <a-menu-item-group key="system" title="System">
          <a-menu-item key="home">Home</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="course" title="Course & Schedule Service">
          <a-menu-item key="courses">Courses</a-menu-item>
          <a-menu-item key="schedules">Schedules</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="student" title="Student, Attendance & Results Service">
          <a-menu-item key="students">Students</a-menu-item>
          <a-menu-item key="enrollments">Enrollments</a-menu-item>
          <a-menu-item key="attendances">Attendances</a-menu-item>
          <a-menu-item key="results">Results</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="payment" title="Payment & Report Service">
          <a-menu-item key="payments">Payments</a-menu-item>
          <a-menu-item key="reports">Reports</a-menu-item>
        </a-menu-item-group>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="app-header">
        <div>
          <span class="header-label">Vue Frontend</span>
          <h1>{{ menuItems.find((item) => item.key === activePage)?.label }}</h1>
        </div>
        <a-tag color="blue">LAN Demo</a-tag>
      </a-layout-header>

      <a-layout-content class="app-content">
        <component :is="ActiveComponent" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
