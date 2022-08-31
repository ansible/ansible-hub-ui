FROM node:16-alpine
WORKDIR /workspace/
RUN mkdir -p /workspace/ && \
    apk add --no-cache git
COPY . /workspace/
RUN npm ci && \
    npm run build-community

FROM registry.access.redhat.com/ubi8/nginx-120:latest
COPY --from=0 /workspace/dist ${NGINX_APP_ROOT}/src
CMD ["nginx", "-g", "daemon off;"]
