# ごじょリアンAR（ピンク・ハート版）

添付のピンクのエイリアン（02_2_texture_fixed 1.glb）を使った、スマホ向けARサイトです。HTML / CSS / JavaScriptで構成し、通常の表示にビルドやAPIキーは不要です。

## GitHubへのアップロードと公開

1. 新しいGitHubリポジトリを作成します。
2. このフォルダの**中身をすべて**リポジトリのルートに追加します。`dist`、`scripts`、`README.md`に加え、`.github/workflows/pages.yml`も含めてください。ZIPそのものはアップロードしません。
3. サイトを公開する場合は、リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** にします。
4. Actionsで **Publish GitHub Pages** を開き、Run workflowを実行します。以降はmainまたはmasterへのpushで再公開します。
5. 完了するとSettings → Pagesに公開URLが表示されます。スマホのSafariまたは対応するAndroidのChromeで開いてください。

コードの保管だけなら手順2までで完了です。公開は任意です。Pagesを使えるリポジトリの範囲はGitHubの契約によって異なります。

## 主な機能

- iPhone外カメ：AR Quick Lookで床を認識して配置。歩いて360度見回し、近づくと大きく見えます。
- ゆっくり浮遊する宇宙人、瞬き、時々現れるピンク・濃いピンクのハート、床の柔らかい影。
- iPhoneのAR画面：白いシャッターをタップして写真、長押しして動画を撮影します。操作部はiOS側の機能です。
- 内カメ：最大3人の顔を検出して、頭の上に宇宙人とハートを表示。写真の撮影・共有・保存に対応します。
- AR対応Android：WebXRで床認識・配置。写真はブラウザがRaw Camera Accessを提供する場合に利用できます。
- 再読み込み、内外カメ切り替え。

内カメの動画録画とWebXRの動画録画は、この版には実装していません。iPhoneのAR画面の「AR／オブジェクト」などの標準操作部は、サイトのHTML/CSSから変更できません。

## ローカルで確認

Python 3がある場合、リポジトリのルートで次を実行します。

```sh
python -m http.server 8000 --directory dist
```

同じPCのブラウザで http://localhost:8000 を開きます。カメラはlocalhostまたはHTTPSが必要です。スマホからPCのHTTPアドレスへ接続する方法では、カメラやARが動かない場合があります。スマホの実機確認にはHTTPSの公開URLを使ってください。

## ファイル構成

- `dist/index.html`：画面
- `dist/style.css`：見た目
- `dist/app.js`：カメラ切り替え、内カメ、写真保存
- `dist/ar-launch.js`：iPhoneのAR Quick Look／WebXR起動
- `dist/walk-mode.js`：WebXRの床認識・空間固定・表示
- `dist/xr-photo.js`：WebXR写真合成
- `dist/alien.js`：内カメの宇宙人描画
- `dist/faces.js`、`face-worker.js`、`face-detector.js`：顔検出
- `dist/stars.js`：ハートの形・出現タイミング
- `dist/assets/alien.glb`：Web表示用3Dモデル
- `dist/assets/alien-ar.usdz`：iPhone用ARモデル（瞬き・浮遊・ハート・影を含む）
- `scripts/`：新モデルのUSDZを再構築するPythonスクリプト
- `.github/workflows/pages.yml`：GitHub Pages公開設定

`floor.js`は以前の簡易床追跡用ファイルで、現在の外カメの空間固定には使用していません。

## 3Dモデルを編集するとき

通常のサイト公開ではPythonライブラリは不要です。USDZをスクリプトで加工する場合のみ、次を実行します。

```sh
python -m pip install -r scripts/requirements.txt
```

補助スクリプトは`dist/assets/alien-ar.usdz`を上書きします。元のファイルをコピーしてから `python scripts/rebuild_native_ar.py` を実行してください。現在の完成済みUSDZは同梱しているので、スクリプトの再実行は不要です。

## 動作確認について

コード構文、USDZの構造・アニメーション、WebXRの位置固定・距離による表示変化を確認しています。今回のピンク版はiPhone実機では未確認です。カメラ・床認識・影・録画の最終確認はスマホ実機で行ってください。

## 外部ライブラリ

Three.js、ONNX Runtime、YuNetのライセンスは`dist/assets/three/LICENSE`と`dist/assets/face/`内に同梱しています。キャラクター素材の利用権は元の権利者に従います。このパッケージ全体に新たなオープンソースライセンスは設定していません。

公開手順の参考： https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
