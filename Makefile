# NOTE: This file's for development purposes only. You won't ever need this.

SOURCE := token-list.js
TARGET := token-list.min.js

all: watch js
js: $(TARGET) update-sizes


# Compress source file
$(TARGET): $(SOURCE)
	uglifyjs -c --mangle < $^ > $@


# Update the filesizes mentioned in the readme
update-sizes: $(TARGET)
	@s1='* '$$(format-bytes -pf $^)' minified'; \
	s2='* '$$(format-bytes -p $$(gzip -c "$^" | wc -c))' minified & gzipped'; \
	repl=$$(printf "\n%s\n%s" "$$s1" "$$s2"); \
	perl -0777 -pi -e "s/(## Total size)(\n\*[^\n]+){2}/\$$1$$repl/gms" README.md



# Shell paths
PWD  := $(shell pwd)
STFU := /dev/null

# Update target when its source file is updated
watch:
	@watchman watch $(PWD) > $(STFU)
	@watchman -- trigger $(PWD) remake-js $(SOURCE) -- make js > $(STFU)

# Stop updating target
unwatch:
	@watchman watch-del $(PWD) > $(STFU)


# Kill compressed file
clean:
	@rm -f $(TARGET)

.PHONY: watch unwatch clean
