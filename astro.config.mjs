// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// ==========================================================================
// 公開先の設定
//
// 公開URL： https://digikoku.com/
//
// site には独自ドメインを書きます。ここを基準にして、
// canonical（このページの正式なURL）と og:url が自動で作られます。
//
// base（サブフォルダ）は使っていません。
// サイトはドメインの直下で公開するため、リンクは /podcast/ のように
// そのまま書けます。
//
// ※ 独自ドメインの指定は、GitHubの Settings → Pages → Custom domain で行います。
//    GitHub Actions で公開する方式では、CNAMEファイルは不要です。
//    ドメインを変えるときは、この site とGitHub側の設定を直してください。
// ==========================================================================

const site = "https://digikoku.com";

// https://astro.build/config
export default defineConfig({
	site,
	integrations: [sitemap()],
});
