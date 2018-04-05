FROM node:alpine
LABEL maintainer="Bjornskjald <github@bjorn.ml>"

RUN npm install --only=production -g miscord

VOLUME ["/config"]

CMD [ "miscord", "-c", "/config/config.json" ]
