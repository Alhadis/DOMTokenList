TARGET := token-list.min.js
SOURCE := token-list.js

all: watch js
js: $(TARGET)


# Compress source file
$(TARGET): $(SOURCE)
	uglifyjs -c --mangle < $^ > $@


# Shell paths
PWD  := $(shell pwd)
STFU := /dev/null

# Update target when its source file is updated
watch:
	@watchman watch $(PWD) > $(STFU)
	@watchman -- trigger $(PWD) remake-js $(SOURCE) -- make $(TARGET) > $(STFU)

# Stop updating target
unwatch:
	@watchman watch-del $(PWD) > $(STFU)


# Kill compressed file
clean:
	@rm -f $(TARGET)

.PHONY: watch unwatch clean
