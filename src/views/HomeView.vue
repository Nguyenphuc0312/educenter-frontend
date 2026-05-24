<template>
  <main class="home-page">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">Fullstack Microservices</p>
        <h2>Course Management System</h2>
        <p>
          Frontend chung cho 3 service: Course & Schedule, Student, Attendance & Results,
          Payment & Report.
        </p>
      </div>

      <div class="service-status">
        <div>
          <span>Machine 1</span>
          <strong>Course API</strong>
        </div>
        <div>
          <span>Machine 2</span>
          <strong>Student API</strong>
        </div>
        <div>
          <span>Machine 3</span>
          <strong>Payment API</strong>
        </div>
        <div>
          <span>Machine 4</span>
          <strong>Vue App</strong>
        </div>
      </div>
    </section>

    <section class="module-grid">
      <article class="module-card">
        <span class="module-code">01</span>
        <h3>Course & Schedule</h3>
        <p>Team 1 code trong `src/modules/courses`.</p>
      </article>

      <article class="module-card">
        <span class="module-code">02</span>
        <h3>Student, Attendance & Results</h3>
        <p>Team 2 code trong `src/modules/students`.</p>
      </article>

      <article class="module-card">
        <span class="module-code">03</span>
        <h3>Payment & Report</h3>
        <p>Team 3 code trong `src/modules/payments`.</p>
      </article>
    </section>
  </main>
</template>
