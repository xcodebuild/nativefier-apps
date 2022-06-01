const fs = require('fs');
const apps = require('./apps');
const path = require('path');

const WORKFLOW_HEAD = `name: ci
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
jobs:
  build:
      strategy:
        matrix:
          os: [macos-latest, windows-latest]
      runs-on: \${{ matrix.os }}
      steps:
        - name: Check out Git repository
          uses: actions/checkout@v1

        - name: Install Node.js, NPM and Yarn
          uses: actions/setup-node@v1
          with:
            node-version: 14

        - name: install deps
          shell: bash
          run: |
            npm install -g nativefier
`;

const BUILD_TEMPLATE = app => {
    return `
    - name: build apps
      shell: bash
      run: |
      if [[ "$RUNNER_OS" == "macOS" ]]; then
        nativefier '${app.url}' --name '${app.name}' -a arm64 -p darwin
        nativefier '${app.url}' --name '${app.name}' -a x64 -p darwin
        nativefier '${app.url}' --name '${app.name}' -a x64 -p linux
        zip -r ${app.name}_macos_arm.zip *darwin-arm64
        zip -r ${app.name}_macos_x64.zip *darwin-x64
        zip -r ${app.name}_linux_x64.zip *linux*
        
        rm -rf *darwin-arm64/
        rm -rf *darwin-x64/
        rm -rf *linux*/
      fi
      if [[ "$RUNNER_OS" == "Windows" ]]; then
        nativefier '${app.url}' --name '${app.name}' -a x64 -p windows
        zip -r ${app.name}_windows_x64.zip *windows*/
        rm -rf *windows*/
      fi
`;
};
const UPLOAD_TEMPLATE = (app, arch, platform) => {
    const id = `${app.name}_${platform}_${arch}`;
    return `
    - name: upload ${id}
      uses: actions/upload-artifact@v2
      with:
        name: ${id}
        path: |
          ${id}.zip
`;
};

const content = [
    WORKFLOW_HEAD,
];

apps.forEach(app => {
    content.push(BUILD_TEMPLATE(app));
    content.push(UPLOAD_TEMPLATE(app, 'arm64', 'macos'));
    content.push(UPLOAD_TEMPLATE(app, 'x64', 'macos'));
    content.push(UPLOAD_TEMPLATE(app, 'x64', 'linux'));
    content.push(UPLOAD_TEMPLATE(app, 'x64', 'windows'));
});

fs.writeFileSync(path.join(__dirname, '.github/workflows/ci.yml'), content.join('\n'), 'utf-8');