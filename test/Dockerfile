FROM cypress/included:4.1.0

WORKDIR .
RUN mkdir /e2e
COPY package.json /e2e/package.json
COPY package-lock.json /e2e/package-lock.json
WORKDIR /e2e

RUN npm ci

ADD cypress /e2e/cypress
COPY entrypoint.sh /entrypoint.sh
COPY cypress.json /e2e/
COPY cypress.*.json /e2e/

ENTRYPOINT /entrypoint.sh
