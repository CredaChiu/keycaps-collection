#!/bin/bash

# Exit on errors
set -e

# Build the project
quasar build

# Navigate into the build output directory
cd dist/spa

# Initialize a new Git repository
if [ ! -d .git ]; then
  git init
fi

git add -A
git commit -m 'deploy'

# Push to the gh-pages branch
git push -f git@github.com:USERNAME/keycaps-collection.git master:gh-pages

cd -
