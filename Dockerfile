FROM node:alpine
LABEL maintainer="ptrcnull <github@ptrcnull.me>"

RUN npm install --only=production -g miscord

VOLUME ["/config"]

ENTRYPOINT [ "miscord" ]
