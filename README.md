# デジ国

「デジ国｜デジタル時代の国語教育を語ろう」の公式Webサイト。
Podcast・Voicy・note・教育系ポッドキャストの日をまとめる公式ハブサイトです。

Astro で制作しています。

## 開発

```bash
npm run dev      # http://localhost:4321 で確認
npm run build    # dist/ に公開用ファイルを出力
npm run preview  # ビルド結果を確認
```

## 編集する場所

| やりたいこと | ファイル |
|---|---|
| 外部リンクのURL | `src/data/site.js` |
| 色・余白・文字サイズ | `src/styles/global.css` |
| 各ページの内容 | `src/pages/` |

Podcastとnoteの最新回は**RSSから自動取得**しているため、手作業は不要です。

## 詳しい引継ぎ

構造・運用・注意点は **[HANDOVER.md](HANDOVER.md)** にまとめています。
作業を再開するときは、まずそちらをご覧ください。
