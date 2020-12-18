FROM cypress/included:4.1.0

ENV CYPRESS_HOST="localhost:8002"
ENV CYPRESS_PREFIX="/api/galaxy/"
ENV CYPRESS_USERNAME="admin"
ENV CYPRESS_PASSWORD="p@ssword1"

WORKDIR .
RUN mkdir /e2e
COPY entrypoint.sh /entrypoint.sh

WORKDIR /e2e
ENTRYPOINT /entrypoint.sh
