FROM nginx:1.31.1-alpine

ARG PORT=80
ENV PORT=${PORT}

COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY index.html about.html projects.html contact.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
