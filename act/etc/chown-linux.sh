find . \
	-exec chown lighttpd:lighttpd {} \; \
	-exec chmod g+w {} \;
