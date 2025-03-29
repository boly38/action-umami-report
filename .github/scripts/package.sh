#!/bin/bash
# GithubActions - skip node_modules in git : cf. https://github.com/orgs/community/discussions/102976
# use @vercel/ncc to package action        : cf. https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github

# exit on first error
set -e

# check `ncc` requirement
if ! command -v ncc &> /dev/null
then
    echo "❌ Error: '@vercel/ncc' is not installed. Please install it globally with:"
    echo "    pnpm install -g @vercel/ncc"
    exit 1
fi

# package with ncc
echo "📦 Running ncc build..."
ncc build index.js

# add action.yml
if [ -f "action.yml" ]; then
    echo "📄 Copying action.yml to dist/..."
    cp action.yml dist/
else
    echo "⚠️ Warning: action.yml not found in the project root."
fi

echo "✅ Packaging complete!"
