FROM cypress/included:4.1.0

ENV CYPRESS_HOST="localhost:8002"
ENV CYPRESS_BASE_URL="http://localhost:8002"
ENV CYPRESS_PREFIX="/api/automation-hub/"
ENV CYPRESS_USERNAME="admin"
ENV CYPRESS_PASSWORD="admin"

WORKDIR .
RUN mkdir /e2e
COPY package.json /e2e/package.json
COPY package-lock.json /e2e/package-lock.json
WORKDIR /e2e

RUN npm ci

COPY entrypoint.sh /entrypoint.sh
COPY cypress.json /e2e/
ADD cypress /e2e/cypress

ENTRYPOINT /entrypoint.sh
