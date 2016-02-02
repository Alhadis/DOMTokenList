# NOTE: This file's for development purposes only. You won't ever need this.

SRC_DIR := src
SRC     := token-list.js svg-fix.js
OBJ     := $(addprefix min/,$(SRC))


# Top-level tasks
all: watch js
js: $(OBJ) update-sizes


# Compress source file
min/%.js: src/%.js
	uglifyjs -c --mangle < $^ > $@


# Update the filesizes mentioned in the readme
update-sizes: $(OBJ)
	@s1='* '$$(format-bytes -pf $<)' minified'; \
	s2='* '$$(format-bytes -p $$(gzip -c "$<" | wc -c))' minified & gzipped'; \
	repl=$$(printf "\n%s\n%s" "$$s1" "$$s2"); \
	perl -0777 -pi -e "s/(## Total size)(\n\*[^\n]+){2}/\$$1$$repl/gms" README.md



# Shell paths
PWD  := $(shell pwd)
STFU := /dev/null

# Update target when its source file is updated
watch:
	@watchman watch $(PWD) > $(STFU)
	@watchman -- trigger $(PWD) remake-js '$(SRC_DIR)/*.js' -- make js > $(STFU)

# Stop updating target
unwatch:
	@watchman watch-del $(PWD) > $(STFU)


# Kill compressed files
clean:
	@rm -f $(OBJ)

.PHONY: watch unwatch clean
