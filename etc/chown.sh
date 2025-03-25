sudo find . \
	-exec chown www:other {} \; \
	-exec chmod g+w {} \;
