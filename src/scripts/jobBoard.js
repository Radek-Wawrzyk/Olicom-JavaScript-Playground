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
    this.listRoot = null;
    this.filtersRoot = null;
    this.jobs = [];
    this.activeJob = null;
    this.activeCategories = {};
    this.apiURL = API_URL;
    this.categories = null;

    this.createRootStructure();
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
      this.renderCategories();
      this.renderJobs();
    } catch(err) {
      console.log(err);
    }
  }

  createRootStructure() {
    const categoriesNode = document.createElement('div');
    const listNode = document.createElement('div');

    categoriesNode.id = 'categories';
    listNode.id = 'jobs';

    this.listRoot = listNode;
    this.filtersRoot = categoriesNode;

    this.root.appendChild(categoriesNode);
    this.root.appendChild(listNode);
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
      location: allLocationValues,
      department: allDepartmentValues,
    };
  }

  renderCategories() {
    this.createCategories();
    const filters = document.createElement('div');
    filters.classList.add('job-board-filters');

    const markup = `
      <ul class="job-board-filters__list">
        ${Object.entries(this.categories).map(([categoryKey, categories]) =>
          `
            <li class="job-board-filters__list-item">
              <p class="job-board-filters__list-name">${categoryKey}</p>

              <ul class="job-board-filters__sub-list">
                ${categories.map((category) => 
                  `
                    <li class="job-board-filters__item">
                      <button 
                        class="job-board-filters__button"
                        type="button"
                        title="${category}"
                        data-category-name="${categoryKey}"
                      >
                        ${category}
                      </button>
                    </li>
                  `
                ).join('')}
              </ul>
            </li>
          `
        ).join('')}
      </ul>
    `;

    filters.innerHTML = markup;
    this.filtersRoot.appendChild(filters);
    this.subscribeFiltersEventListeners()
  }

  subscribeFiltersEventListeners() {
    const categories = this.root.querySelectorAll('.job-board-filters__button');

    categories.forEach((category) => {
      category.addEventListener('click', () => {
        if (category.classList.contains('job-board-filters__button--is-active')) {
          category.classList.remove('job-board-filters__button--is-active');
        } else {
          category.classList.add('job-board-filters__button--is-active');
        }

        this.selectCategory(category.dataset.categoryName, category.textContent.trim());
      });

      if (category.textContent.trim() == this.activeCategories[category.dataset.categoryName]) {
        category.classList.add('job-board-filters__button--is-active');
      }
    })
  }

  selectCategory(categoryName, categoryValue) {
    let jobs = this.getJobs();

    if (this.activeCategories[categoryName] === categoryValue) delete this.activeCategories[categoryName];
    else this.activeCategories[categoryName] = categoryValue;

    Object.keys(this.activeCategories).forEach((categoryKey) => {
      jobs = jobs.filter((job) => {
        return job[categoryKey] === this.activeCategories[categoryKey];
      });
    });

    this.renderJobs(jobs);
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

    this.listRoot.innerHTML = markup;
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



