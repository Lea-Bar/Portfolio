async function fetchProjects() {
    try {
        const response = await fetch('./assets/data/projects.json');
        const data = await response.json();
        return data.projects;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

function createTag(technology) {
    const tag = document.createElement('span');
    tag.className = 'technologyTag';
    tag.textContent = technology;
    return tag;
}

function openModal(project) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('projectTitle');
    const date = document.getElementById('projectDate');
    const image = document.getElementById('projectImage');
    const description = document.getElementById('projectDescription');
    const technologiesContainer = document.getElementById('projectTechnologies');
    const workSection = document.getElementById('projectWorkSection');
    const workDone = document.getElementById('projectWorkDone');
    const link = document.getElementById('projectLink');

    title.textContent = project.title;
    date.textContent = project.date ? project.date : '';
    
    if (project.image) {
        image.src = project.image;
        image.alt = project.title;
        image.style.display = 'block';
    } else {
        image.style.display = 'none';
    }

    description.textContent = project.description;
    
    technologiesContainer.innerHTML = '';
    if (project.technologies) {
        project.technologies.forEach(technology => {
            technologiesContainer.appendChild(createTag(technology));
        });
    }

    if (project.workDone) {
        workSection.style.display = 'block';
        workDone.textContent = project.workDone;
    } else {
        workSection.style.display = 'none';
    }

    if (project.link) {
        link.href = project.link;
        link.style.display = '';
    } else {
        link.style.display = 'none';
    }

    modal.style.display = 'flex';
    modal.querySelector('.projectContent').scrollTop = 0;
    document.body.classList.add('modalOpen');

    // Let the phone/browser "back" action close the modal instead of leaving the page
    if (!history.state || !history.state.projectModal) {
        history.pushState({ projectModal: true }, '');
    }
}

function hideModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    document.body.classList.remove('modalOpen');
}

function closeModal() {
    if (history.state && history.state.projectModal) {
        history.back(); // triggers popstate, which hides the modal
    } else {
        hideModal();
    }
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'projectCard';

    if (project.image) {
        const image = document.createElement('img');
        image.className = 'cardImage';
        image.src = project.image;
        image.alt = project.title;
        image.loading = index < 2 ? 'eager' : 'lazy';
        image.decoding = 'async';
        card.appendChild(image);
    }

    const title = document.createElement('h3');
    title.className = 'cardTitle';
    title.textContent = project.title;
    card.appendChild(title);

    if (project.date) {
        const date = document.createElement('div');
        date.className = 'cardDate';
        date.textContent = project.date;
        card.appendChild(date);
    }

    const technologies = document.createElement('div');
    technologies.className = 'technologiesContainer';
    if (project.technologies) {
        const maxTags = 3;
        const displayTags = project.technologies.slice(0, maxTags);
        
        displayTags.forEach(tech => {
            technologies.appendChild(createTag(tech));
        });

        if (project.technologies.length > maxTags) {
            const moreTag = createTag(`+${project.technologies.length - maxTags}`);
            technologies.appendChild(moreTag);
        }
    }
    card.appendChild(technologies);

    const description = document.createElement('p');
    description.className = 'cardDescription';
    
    const maxLength = project.image ? 120 : 350;

    if (project.description.length > maxLength) {
        description.textContent = project.description.substring(0, maxLength) + '...';
    } else {
        description.textContent = project.description;
    }
    card.appendChild(description);

    const button = document.createElement('button');
    button.className = 'seeMoreButton';
    button.textContent = 'En savoir plus';
    button.onclick = () => openModal(project);
    card.appendChild(button);

    return card;
}

function initializeModal() {
    const modal = document.getElementById('projectModal');
    const closeButton = document.getElementById('closeModal');

    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    window.addEventListener('popstate', () => {
        if (modal.style.display === 'flex') {
            hideModal();
        }
    });

    // A reload while the modal was open leaves a stale history entry
    if (history.state && history.state.projectModal) {
        history.replaceState(null, '');
    }
}

async function initializeProjects() {
    const container = document.getElementById('projects');
    const projects = await fetchProjects();

    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
        fragment.appendChild(createProjectCard(project, index));
    });
    container.appendChild(fragment);

    initializeModal();
}

document.addEventListener('DOMContentLoaded', () => {
    initializeProjects();
});