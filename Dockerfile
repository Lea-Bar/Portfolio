FROM node:24-alpine AS build

WORKDIR /app
COPY projects.html ./
COPY data ./data
COPY scripts ./scripts
RUN node scripts/build-projects.mjs dist/projects.html

FROM nginx:1.31.1-alpine

ARG PORT=80
ENV PORT=${PORT}

COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY index.html about.html contact.html /usr/share/nginx/html/
COPY --from=build /app/dist/projects.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
