# みちしるべ — 京都の散歩地図

歩いた道を回数別に色分けする京都の地図アプリ（v1.7 / build 534af663ee4c）。
ChatGPT Sites で作った版を、GitHub Pages など普通の静的ホスティングで動く形にしたものです。
記録（あしあと・食事・ペット・記念日）は各自のブラウザにだけ保存されます。

## 公開のしかた（GitHub Pages）

1. GitHub で新しいリポジトリを作る（Public）
2. このフォルダの中身を **すべて同じ階層に** アップロードする（index.html がリポジトリ直下に来るように）
3. リポジトリの Settings → Pages → Source を「Deploy from a branch」、Branch を `main` / `/(root)` にして Save
4. 数分後に `https://ユーザー名.github.io/リポジトリ名/` で開ける

スマホの「ホーム画面に追加」でアプリのように使えます。位置情報の記録には https が必要なので、GitHub Pages ならそのまま動きます。

## 構成

- `index.html` — 画面。JS は `app.js` から各モジュール（`*.js`）を読み込みます
- `leaflet.js` / `protomaps-leaflet.js` / `leaflet.css` — 地図ライブラリ
- `kyoto.json` — 京都府の境界（府内判定用）。地球地図日本（国土地理院）を [dataofjapan/land](https://github.com/dataofjapan/land) が GeoJSON 化したものから抽出
- `search-config.json` — 施設検索の接続先（Photon / OpenStreetMap）
- `version.json` — 「アプリの更新」で参照。新しい版を置くときは `version`・`build` を `index.html` の `<meta name="app-version">` / `app-build` と揃える
- `green-index.json` / `green-overview.geojson` — 緑地レイヤー。元データが取り出せなかったため、いまは空（地図は緑地の薄緑なしで表示されます）。元サイトの `green/` 一式が手に入ったら `green-<キー>.geojson` の名前で置き、`green-index.json` にキーの配列を書くと復活します

## 地図・データの出典

- 地図：[国土地理院ベクトルタイル](https://maps.gsi.go.jp/vector/)（最適化ベクトルタイル）
- 境界：地球地図日本（国土地理院）
- 検索：© [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors（Photon）
- 天気：[Open-Meteo](https://open-meteo.com/)
