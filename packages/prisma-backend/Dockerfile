FROM alpine:3.11.2

ENV LANG=C.UTF-8
ENV GLIBC_VERSION 2.30-r0

# Download and install glibc
RUN apk add --update curl && \
  curl -Lo /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
  curl -Lo glibc.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk" && \
  curl -Lo glibc-bin.apk "https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-bin-${GLIBC_VERSION}.apk" && \
  apk add glibc-bin.apk glibc.apk && \
  /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc-compat/lib && \
  echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf && \
  apk del curl && \
  rm -rf glibc.apk glibc-bin.apk /var/cache/apk/*


RUN apk add nodejs npm python g++ make && rm -rf /var/cache/apk/*

WORKDIR /usr/app
COPY package*.json ./

RUN npm install --quiet --production
RUN npm audit fix

COPY ./prisma .
COPY ./dist .
RUN npm run generate
# RUN npx prisma2 migration up --experimental
ENV NODE_ENV=production

EXPOSE $PORT

CMD NODE_ENV=production node server.js
