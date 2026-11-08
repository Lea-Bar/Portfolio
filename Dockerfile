FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8 AS build

WORKDIR /app
COPY projects.html ./
COPY data ./data
COPY scripts ./scripts
RUN node scripts/build-projects.mjs dist/projects.html

FROM nginxinc/nginx-unprivileged:1.31.1-alpine@sha256:cc300bd2e8776708a8c2c8686a74f06eadf221c5ce01e85d0e821955d7a730ab

ARG PORT=8080
ENV PORT=${PORT}

COPY --chown=root:root --chmod=444 nginx.conf /tmp/default.conf.template
COPY --chown=root:root --chmod=444 security-headers.conf /etc/nginx/security-headers.conf
USER root
RUN PORT=${PORT} envsubst '${PORT}' < /tmp/default.conf.template > /etc/nginx/conf.d/default.conf \
    && rm /tmp/default.conf.template \
    && chmod 444 /etc/nginx/conf.d/default.conf \
    && rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
USER 101

# Site files are owned by root and read-only for nginx.
COPY --chown=root:root --chmod=444 index.html about.html contact.html /usr/share/nginx/html/
COPY --from=build --chown=root:root --chmod=444 /app/dist/projects.html /usr/share/nginx/html/
COPY --chown=root:root --chmod=a=rX assets /usr/share/nginx/html/assets

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:${PORT}/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
