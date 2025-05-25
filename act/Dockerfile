FROM alpine:3.21.3

LABEL org.opencontainers.image.title="Lighttpd"
LABEL org.opencontainers.image.authors="RTSP <docker@rtsp.us>"
LABEL org.opencontainers.image.source="https://github.com/rtsp/docker-lighttpd"
LABEL org.opencontainers.image.licenses="Apache-2.0"

ARG LIGHTTPD_VERSION=1.4.76-r0

RUN set -x \
    && apk add --no-cache \
    lighttpd \
    lighttpd-mod_auth \
    musl-dev \
    go vim rlwrap sqlite git curl gcc make \
    && rm -rvf /var/cache/apk/* \
    && rm -rvf /etc/lighttpd/* /etc/logrotate.d/lighttpd /var/log/lighttpd /var/www/localhost \
    && mkdir -vp /var/www/html

RUN mkdir -p /var/log/lighttpd
RUN chown lighttpd:lighttpd /var/log/lighttpd

WORKDIR /opt/local/gw
RUN git clone https://github.com/bleedsa/gw .
RUN CGO_ENABLED=1 go build
RUN cp gw /usr/bin/gw

COPY etc/lighttpd/ /etc/lighttpd/
COPY . /var/www/html/
WORKDIR /var/www/html
RUN sqlite3 casino.db < etc/tables.sql

RUN etc/chown-linux.sh
RUN chown lighttpd:lighttpd /var/www
RUN chown lighttpd:lighttpd /var/www/html

EXPOSE 80/tcp

ENTRYPOINT ["/usr/sbin/lighttpd"]
CMD ["-D", "-f", "/etc/lighttpd/lighttpd.conf"]
