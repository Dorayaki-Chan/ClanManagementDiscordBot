# 概要
Discord.jsを使用したクランDiscord鯖管理Botのコードリポジトリです。
現在、src-js-2とsrc-tsの2つのディレクトリがあります。
src-js-2では、かろうじて動く状態のコードを置いています。
その実績を基にsrc-tsでは、より最適化されたシステムに換装したいです。
※src-js-2はsrc-tsの安定稼働を持って削除しました。

# src-js-2とsrc-tsの違い
|分類|src-js-2|src-ts|
|-----|--------|------|
|コードの可読性|低い|高い|
|コードの保守性|低い|高い|
|コードの安全性|低い|高い|
|使用言語|JavaScript|TypeScript|
|各ライブラリのバージョン|2022年前後のもの|2026年以降最新のもの|
|データベース|MySQL(別途用意)|MySQL(DockerComposeで一緒に定義)|
|デプロイ方法|.jsプロジェクトをそのままデプロイ|DockerComposeでデプロイ|
|本番環境|ラズパイ4B(Ubuntu MATE)|Ugreen nas　DXP2800(Debian GNU/Linux 12 (bookworm))|
|CPU|AMD|Intel 64bit|

# フォルダー構成
- doc : ドキュメント関連のファイルを置くフォルダ
- src-js-2 : JavaScriptで書かれたコードを置くフォルダ(現行システム)
- src-ts : TypeScriptで書かれたコードを置くフォルダ(新システム)

# 注意点
- 各コードには必ずログ出力の処理を入れること。ログはlogsフォルダに保存される。