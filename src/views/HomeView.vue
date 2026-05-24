<script setup>
import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  HomeOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'

const serviceCards = [
  {
    title: 'Course Service',
    machine: 'Machine 1',
    state: 'Live',
    color: 'blue',
    icon: BookOutlined,
  },
  {
    title: 'Student Service',
    machine: 'Machine 2',
    state: 'Live',
    color: 'green',
    icon: UserOutlined,
  },
  {
    title: 'Payment Service',
    machine: 'Machine 3',
    state: 'Live',
    color: 'gold',
    icon: CreditCardOutlined,
  },
  {
    title: 'Vue Frontend',
    machine: 'Machine 4',
    state: 'Live',
    color: 'purple',
    icon: HomeOutlined,
  },
]

const teamCards = [
  {
    code: '01',
    title: 'Course & Schedule',
    description: 'Course, class, and schedule management for Team 1.',
    icon: CalendarOutlined,
    chips: ['Courses', 'Classes', 'Schedules'],
    tone: 'tone-blue',
  },
  {
    code: '02',
    title: 'Student & Attendance',
    description: 'Profiles, enrollments, attendance, and results for Team 2.',
    icon: CheckSquareOutlined,
    chips: ['Students', 'Enrollments', 'Attendances', 'Results'],
    tone: 'tone-cyan',
  },
  {
    code: '03',
    title: 'Payment & Report',
    description: 'Payments, debts, and reporting for Team 3.',
    icon: CreditCardOutlined,
    chips: ['Payments', 'Debts', 'Reports'],
    tone: 'tone-violet',
  },
  {
    code: '04',
    title: 'Shared Frontend',
    description: 'Single Vue shell for LAN demo and team handoff.',
    icon: BarChartOutlined,
    chips: ['Vue 3', 'Ant Design Vue', 'Direct API'],
    tone: 'tone-slate',
  },
]

const summaryCards = [
  {
    label: 'Services online',
    value: '3',
    note: 'Course, Student, Payment',
    icon: HomeOutlined,
  },
  {
    label: 'CRUD modules',
    value: '9',
    note: 'Students, enrollments, attendances, results',
    icon: CheckSquareOutlined,
  },
  {
    label: 'LAN endpoints',
    value: '3',
    note: 'Direct calls to each API',
    icon: BookOutlined,
  },
  {
    label: 'Front-end shell',
    value: '1',
    note: 'Shared Vue workspace for the demo',
    icon: BarChartOutlined,
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Open the shell',
    text: 'Use the shared landing page as the entry point for the demo.',
  },
  {
    step: '02',
    title: 'Test each module',
    text: 'Move between the three team areas without changing the front-end shell.',
  },
  {
    step: '03',
    title: 'Check the APIs',
    text: 'Swagger and LAN endpoints stay available for direct verification.',
  },
]
</script>

<template>
  <main class="home-page">
    <section class="home-hero">
      <div class="hero-copy">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          LAN demo workspace
        </div>

        <h2>EduCenter Platform</h2>

        <p>
          A shared Vue shell for the three microservice teams. The landing page gives the demo
          a clear entry point while each module still talks to its own API directly on the LAN.
        </p>

        <div class="hero-pills">
          <a-tag color="blue">Direct API</a-tag>
          <a-tag color="green">Swagger Ready</a-tag>
          <a-tag color="purple">Vue 3 + Ant Design</a-tag>
        </div>
      </div>

      <div class="hero-panel">
        <div class="hero-panel__header">
          <span>Runtime</span>
          <a-tag color="green">Ready</a-tag>
        </div>

        <div class="status-grid">
          <article
            v-for="service in serviceCards"
            :key="service.title"
            class="status-card"
          >
            <span class="status-icon">
              <component :is="service.icon" />
            </span>

            <div class="status-copy">
              <strong>{{ service.title }}</strong>
              <span>{{ service.machine }}</span>
            </div>

            <a-tag :color="service.color">{{ service.state }}</a-tag>
          </article>
        </div>
      </div>
    </section>

    <section class="summary-grid">
      <article
        v-for="item in summaryCards"
        :key="item.label"
        class="summary-card"
      >
        <span class="summary-icon">
          <component :is="item.icon" />
        </span>
        <div class="summary-copy">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.note }}</p>
        </div>
      </article>
    </section>

    <section class="overview-grid">
      <article
        v-for="team in teamCards"
        :key="team.code"
        class="overview-card"
        :class="team.tone"
      >
        <div class="overview-card__head">
          <span class="overview-icon">
            <component :is="team.icon" />
          </span>
          <span class="overview-code">{{ team.code }}</span>
        </div>

        <h3>{{ team.title }}</h3>
        <p>{{ team.description }}</p>

        <div class="overview-chips">
          <span v-for="chip in team.chips" :key="chip" class="overview-chip">
            {{ chip }}
          </span>
        </div>
      </article>
    </section>

    <section class="workflow-strip">
      <article
        v-for="step in workflowSteps"
        :key="step.step"
        class="workflow-step"
      >
        <span class="workflow-step__index">{{ step.step }}</span>
        <div>
          <strong>{{ step.title }}</strong>
          <p>{{ step.text }}</p>
        </div>
      </article>
    </section>
  </main>
</template>
