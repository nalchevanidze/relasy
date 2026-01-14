# Relasy Actions

## Overview

This repository contains GitHub Actions developed to facilitate release management. These actions can be integrated into your GitHub workflows to automate the process of creating and publishing releases.

## Draft Release Action Template

requires the following Workflow permissions to be set to "Read and write":

```yaml
name: Draft Release
on: workflow_dispatch

permissions:
  contents: write
  pull-requests: write

jobs:
  draft-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main
          fetch-depth: 0

      - name: Setup
        run: # Commands to setup release environment and bump version

      - name: Draft Release
        uses: nalchevanidze/relasy/actions/draft-release@0.1.5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

## Publish Release Action Template

```yaml
name: Publish Release
on:
  pull_request:
    types: [closed]

jobs:
  publish_release:
    if: ${{ github.base_ref == 'main' && startsWith(github.head_ref, 'release-') && github.event.pull_request.merged == true  }}
    runs-on: ubuntu-latest
    outputs:
      upload_url: ${{ steps.publish.outputs.upload_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Publish to Registry
        run: # Commands to publish package to registry

      - name: Publish Release
        uses: nalchevanidze/relasy/actions/publish-release@0.1.5
        id: publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```
