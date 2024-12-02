FROM node:22-alpine
WORKDIR /workspace/
RUN mkdir -p /workspace/ && \
    apk add --no-cache git
COPY . /workspace/
COPY community/index.html /workspace/src/index.html
RUN npm ci && \
    npm run gettext:extract && \
    npm run gettext:compile && \
    npm run build-community

FROM registry.access.redhat.com/ubi8/nginx-120:latest
COPY --from=0 /workspace/dist ${NGINX_APP_ROOT}/src
COPY community/nginx/nginx.conf /etc/nginx/nginx.conf
COPY community/nginx/nginx.d/ /opt/app-root/etc/nginx.d/
CMD ["nginx", "-g", "daemon off;"]
