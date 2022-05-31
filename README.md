# nativefier-apps
Build apps with nativefier &amp; github actions

## App List

- 开黑啦：kaiheila.cn/

## Download

Download from [https://nightly.link/xcodebuild/nativefier-apps/workflows/ci/main](https://nightly.link/xcodebuild/nativefier-apps/workflows/ci/main)

## Tips for macOS users

打开时如果提示文件已损坏，需要执行

If the prompt file is corrupted when opening, you need to execute

```
sudo xattr -rd com.apple.quarantine /Applications/{{Your app name}}.app
```
