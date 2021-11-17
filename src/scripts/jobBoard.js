document.addEventListener('DOMContentLoaded', () => {
  const boardRoot = document.querySelector('#job-board');

  if (boardRoot) {
    const board = new JobBoard(boardRoot);
  }
});

const API_URL = 'https://vayio.recruitee.com/api';

class JobBoard {
  constructor(root) {
    this.root = root;
    this.jobs = [];
    this.activeJob = null;
    this.apiURL = API_URL;
    this.categories = null;

    this.fetchJobs();
  }

  async fetchJobs() {
    try {
      const response = await fetch(`${this.apiURL}/offers`);
  
      if (!response.ok || response.status !== 200) {
        throw new Error('Bad request');
      }

      const { offers: jobs } = await response.json();
      this.setJobs(jobs);
      this.renderJobs();
      this.renderCategories();
    } catch(err) {
      console.log(err);
    }
  }

  createCategories() {
    const allLocationValues = [];
    const allDepartmentValues = [];

    this.getJobs().forEach((job) => {
      if (!allLocationValues.includes(job.location)) {
        allLocationValues.push(job.location);
      }

      if (!allDepartmentValues.includes(job.department)) {
        allDepartmentValues.push(job.department);
      }
    });

    this.categories =  {
      locations: allLocationValues,
      departments: allDepartmentValues,
    };
  }

  renderCategories() {
    this.createCategories();
    const filters = document.createElement('div');
    filters.classList.add('job-modal-filters');

    const markup = `
      <ul class="job-modal-filters__list">
        ${Object.entries(this.categories).map(([categoryKey, categories]) =>
          `
            <li class="job-modal-filters__list-item">
              ${categoryKey}

              <ul class="">
                ${categories.map((category) => 
                  `
                    <li>
                      ${category}
                    </li>
                  `
                ).join('')}
              </ul>
            </li>
          `
        ).join('')}
      </ul>
    `;

    const filterDropdownHTML = `
      <div class="dropdown is-active">
      <div class="dropdown-trigger">
        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu2">
          <span>Filters</span>
          <span class="icon is-small">
            <i class="fas fa-angle-down" aria-hidden="true"></i>
          </span>
        </button>
      </div>

      <div class="dropdown-menu" id="dropdown-menu2" role="menu">
        <div class="dropdown-content">
          ${Object.entries(this.categories).map(([categoryKey, categories]) =>
            `
              <div class="dropdown-item">
                <strong>${categoryKey}</strong>

                <ul class="">
                  ${categories.map((category) => 
                    `
                      <li class="dropdown-item">
                        ${category}
                      </li>
                    `
                  ).join('')}
                </ul>
              </div>
              <hr class="dropdown-divider">
            `
          ).join('')}
        </div>
      </div>
    </div>
    `;

    filters.innerHTML = markup + filterDropdownHTML;
    this.root.insertBefore(filters, this.root.firstChild);
    // ToDo - Subscribe dropdown close/open/select events
  }

  setJobs(jobs) {
    this.jobs = jobs;
  }

  getJobs() {
    return this.jobs;
  }

  renderJobs(jobs = this.getJobs()) {
    const markup = `
      <ul class="job-board__list">
        ${jobs.map((job) => 
          `
            <li class="job-board-offer" data-job-id="${job.id}">
              ${job.title}
            </li>
          `
        ).join('')}
      </ul>
    `;
    
    this.root.innerHTML = markup;
    this.subscribeEventListeners();
  }

  subscribeEventListeners() {
    const jobs = this.root.querySelectorAll('.job-board__list .job-board-offer');
    
    jobs.forEach((job) => {
      job.addEventListener('click', () => {
        const { jobId } = job.dataset;
        const jobData = this.getJobData(jobId);
        this.renderModal(jobData);
      });
    });
  }

  getJobData(id) {
    return this.getJobs().find((job) => Number(job.id) == Number(id));
  }

  renderModal(jobPayload) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'job-modal');

    const markup = `
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">${jobPayload.title}</p>
          <button class="delete" aria-label="close"></button>
        </header>

        <section class="modal-card-body">
          <div class="job-modal__content">
            <h3 class="job-modal__content-heading">
              Job description
            </h3>

            <div class="job-modal__content-data">
              ${jobPayload.description}
            </div>

            <h3 class="job-modal__content-heading">
              Requirements
            </h3>

            <div class="job-modal__content-data">
              ${jobPayload.requirements}
            </div>
          </div>
        </section>

        <footer class="modal-card-foot">
          <a 
            href="${jobPayload.careers_apply_url}" 
            target="_blank"
            class="job-modal__content-button button is-success"
          >
            Apply for this job
          </a>
          <button class="button close">Cancel</button>
        </footer>
      </div>
    `;
    
    modal.innerHTML = markup;
    this.openModal(modal);
    this.subscribeModalListeners(modal);
  }

  subscribeModalListeners(modalNode) {
    const closeTriggers = [ 
      modalNode.querySelector('.modal-card-head .delete'),
      modalNode.querySelector('.modal-card-foot .close'),
      modalNode.querySelector('.modal-background')
    ];

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        this.closeModal(modalNode);
      })
    })

    const escKeyHandler = (event) => {
      if (event.key === 'Escape') {
        this.closeModal(modalNode);
        document.removeEventListener('keydown', escKeyHandler);
      }
    };

    document.addEventListener('keydown', escKeyHandler);
  }

  openModal(modalNode) {
    document.body.insertBefore(modalNode, document.body.firstChild);

    setTimeout(() => {
      modalNode.classList.add('is-active');
    }, 0);
  }

  closeModal(modalNode) {
    modalNode.classList.remove('is-active');

    modalNode.addEventListener('transitionend', () => {
      modalNode.remove(modalNode);
    });
  }
};

// ToDo - Create categories, modal, filtration based on categories



