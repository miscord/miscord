FROM node:alpine
LABEL maintainer="Bjornskjald <github@bjorn.ml>"

RUN apk update && \
    apk upgrade && \
    apk add git


RUN npm install --only=production -g miscord

VOLUME ["/config"]

CMD [ "miscord", "-c", "/config/config.json" ]
