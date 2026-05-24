<script setup>
import { computed, h, ref } from 'vue'
import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  BellOutlined,
  SearchOutlined,
  HomeOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
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

const pageMeta = {
  home: {
    group: 'System',
    description: 'Overview of the shared frontend shell and LAN demo entry point.',
  },
  courses: {
    group: 'Course & Schedule',
    description: 'Course and timetable management owned by Team 1.',
  },
  schedules: {
    group: 'Course & Schedule',
    description: 'Session planning and room scheduling for Team 1.',
  },
  students: {
    group: 'Student, Attendance & Results',
    description: 'Student profiles, enrollments, attendance, and results for Team 2.',
  },
  enrollments: {
    group: 'Student, Attendance & Results',
    description: 'Enrollment records and linked student data for Team 2.',
  },
  attendances: {
    group: 'Student, Attendance & Results',
    description: 'Attendance records per schedule for Team 2.',
  },
  results: {
    group: 'Student, Attendance & Results',
    description: 'Result management and score tracking for Team 2.',
  },
  payments: {
    group: 'Payment & Report',
    description: 'Payments, debts, and finance workflows owned by Team 3.',
  },
  reports: {
    group: 'Payment & Report',
    description: 'Reporting and dashboard data owned by Team 3.',
  },
}

const activePage = ref('home')
const activeMenuItem = computed(() => menuItems.find((item) => item.key === activePage.value))
const activePageMeta = computed(() => pageMeta[activePage.value] ?? pageMeta.home)
const ActiveComponent = computed(() => pages[activePage.value] ?? HomeView)
</script>

<template>
  <a-layout class="app-shell">
    <a-layout-sider
      class="app-sidebar"
      width="260"
      breakpoint="lg"
      collapsed-width="0"
    >
      <div class="brand">
        <div class="brand-mark">EC</div>
        <div class="brand-copy">
          <strong>EduCenter</strong>
          <span>Microservices dashboard</span>
        </div>
      </div>

      <a-menu
        class="sidebar-menu"
        mode="inline"
        :selected-keys="[activePage]"
        @click="({ key }) => (activePage = key)"
      >
        <a-menu-item-group key="system" title="System">
          <a-menu-item key="home" :icon="h(HomeOutlined)">Home</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="course" title="Course &amp; Schedule">
          <a-menu-item key="courses" :icon="h(BookOutlined)">Courses</a-menu-item>
          <a-menu-item key="schedules" :icon="h(CalendarOutlined)">Schedules</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="student" title="Student &amp; Attendance">
          <a-menu-item key="students" :icon="h(UserOutlined)">Students</a-menu-item>
          <a-menu-item key="enrollments" :icon="h(BookOutlined)">Enrollments</a-menu-item>
          <a-menu-item key="attendances" :icon="h(CheckSquareOutlined)">Attendances</a-menu-item>
          <a-menu-item key="results" :icon="h(TrophyOutlined)">Results</a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group key="payment" title="Payment &amp; Report">
          <a-menu-item key="payments" :icon="h(CreditCardOutlined)">Payments</a-menu-item>
          <a-menu-item key="reports" :icon="h(BarChartOutlined)">Reports</a-menu-item>
        </a-menu-item-group>
      </a-menu>

      <div class="sidebar-foot">
        <span>LAN mode</span>
        <strong>Direct service calls</strong>
        <small>5001 · 5002 · 5003</small>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="app-header">
        <div class="header-copy">
          <span class="header-label">{{ activePageMeta.group }}</span>
          <h1>{{ activeMenuItem?.label }}</h1>
          <p>{{ activePageMeta.description }}</p>
        </div>
        <div class="header-meta">
          <a-input
            class="header-search"
            :prefix="h(SearchOutlined)"
            placeholder="Tìm nhanh..."
            allow-clear
          />
          <a-badge dot>
            <a-button class="header-icon-button" type="text" :icon="h(BellOutlined)" />
          </a-badge>
          <div class="header-avatar">NP</div>
        </div>
      </a-layout-header>

      <a-layout-content class="app-content">
        <component :is="ActiveComponent" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
