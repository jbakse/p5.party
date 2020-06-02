#!/bin/bash
find . -type f -name "*.md" -print0 | xargs -0 sed -i '' -e 's/%20.\{32\}\//\//g'
find . -type f -name "*.md" -print0 | xargs -0 sed -i '' -e 's/%20.\{32\}\./\./g'

