# WARNING
# This Dockerfile is intended for development purposes only. Do not use it for production deployments

FROM node:14-alpine3.10
WORKDIR /hub/

RUN mkdir -p /hub/app/ && \
    apk add --no-cache git

# install npm in /hub and mount the app in /hub/app so that the installed node_modules
# doesn't trample node_modules on your computer. see https://www.docker.com/blog/keep-nodejs-rockin-in-docker/ for details
COPY docker package.json package-lock.json /hub/
RUN chmod +x /hub/entrypoint.sh && \
    npm install

# make webpack-dev-sever and other node packages executable
ENV PATH /hub/node_modules/.bin:$PATH
ENV NODE_OPTIONS=--max_old_space_size=4096

WORKDIR /hub/app
EXPOSE 8002
CMD ["/hub/entrypoint.sh"]
