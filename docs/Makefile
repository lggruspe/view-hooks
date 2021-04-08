SOURCES = $(shell ls *.md)
TARGETS = $(patsubst %.md,%.html,$(SOURCES))

all:	$(TARGETS)

$(TARGETS):	%.html:	%.md
	pandoc -s -c styles/style.css $< -o $@ --toc --section-divs -A templates/footer.html

.PHONY:	all
