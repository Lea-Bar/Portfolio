import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER = '<!-- PROJECTS -->';

const TEMPLATE_PATH = 'projects.html';
const DATA_PATH = 'data/projects.json';
const DEFAULT_OUTPUT_PATH = 'dist/projects.html';

const MAX_TAGS = 3;
const EAGER_IMAGE_COUNT = 2;
const MAX_DESCRIPTION_LENGTH_WITH_IMAGE = 120;
const MAX_DESCRIPTION_LENGTH_WITHOUT_IMAGE = 350;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const output = resolve(process.argv[2] ?? resolve(root, DEFAULT_OUTPUT_PATH));

const escape = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const tag = (technology) => `<span class="technologyTag">${escape(technology)}</span>`;

function renderDetails(project) {
    const technologies = project.technologies ?? [];

    return [
        `<h2 id="projectTitle" class="projectTitle">${escape(project.title)}</h2>`,
        `<p class="projectDate">${escape(project.date ?? '')}</p>`,
        project.image
                ? `<img class="projectImage" src="${escape(project.image)}" alt="${escape(project.title)}" loading="lazy" decoding="async">`
                : '',
        `<div class="technologiesContainer">${technologies.map(tag).join('')}</div>`,
        `<p class="projectDescription">${escape(project.description)}</p>`,
        project.workDone
                ? `<div><h3>Travail réalisé</h3><p>${escape(project.workDone)}</p></div>`
                : '',
        project.link
                ? `<a href="${escape(project.link)}" target="_blank" rel="noopener" class="projectLink">Voir le projet</a>`
                : '',
    ]
            .filter(Boolean)
            .join('\n');
}

function renderCard(project, index) {
    const technologies = project.technologies ?? [];
    const tags = technologies
            .slice(0, MAX_TAGS)
            .map(tag);
    if (technologies.length > MAX_TAGS) {
        tags.push(tag(`+${technologies.length - MAX_TAGS}`));
    }

    const maxLength = project.image
            ? MAX_DESCRIPTION_LENGTH_WITH_IMAGE
            : MAX_DESCRIPTION_LENGTH_WITHOUT_IMAGE;
    const description = project.description.length > maxLength
            ? project.description.substring(0, maxLength) + '...'
            : project.description;

    return [
        '<div class="projectCard">',
        project.image
                ? `<img class="cardImage" src="${escape(project.image)}" alt="${escape(project.title)}" loading="${index < EAGER_IMAGE_COUNT ? 'eager' : 'lazy'}" decoding="async">`
                : '',
        `<h3 class="cardTitle">${escape(project.title)}</h3>`,
        project.date
                ? `<div class="cardDate">${escape(project.date)}</div>`
                : '',
        `<div class="technologiesContainer">${tags.join('')}</div>`,
        `<p class="cardDescription">${escape(description)}</p>`,
        '<button type="button" class="seeMoreButton">En savoir plus</button>',
        `<template class="projectDetails">${renderDetails(project)}</template>`,
        '</div>',
    ]
            .filter(Boolean)
            .join('\n');
}

const [template, json] = await Promise.all([
    readFile(resolve(root, TEMPLATE_PATH), 'utf8'),
    readFile(resolve(root, DATA_PATH), 'utf8'),
]);

if (!template.includes(PLACEHOLDER)) {
    throw new Error(`projects.html is missing the ${PLACEHOLDER} placeholder`);
}

const { projects } = JSON.parse(json);
const html = template.replace(
        PLACEHOLDER,
        () => projects
                .map(renderCard)
                .join('\n')
);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`Rendered ${projects.length} projects into ${output}`);