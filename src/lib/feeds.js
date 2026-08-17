// ==========================================================================
// feeds.js  ―  RSSフィードを読み込んで、カードに渡せる形に整えるための道具
//
// 【いつ取得されるか】
// このサイトは「静的サイト」なので、RSSの取得は
//   ・npm run dev  … ページを表示するたび
//   ・npm run build … ビルドしたときの1回だけ
// に行われます。訪問者のブラウザでは通信は起きません（表示が速い）。
//
// つまり公開後は、ビルドし直したタイミングで最新の内容に更新されます。
// 自動で毎日更新したい場合は、GitHub Actions などで定期的にビルドします。
//
// 【外部パッケージを使っていない理由】
// npmパッケージを増やさない方針のため、必要な部分だけを自前で取り出しています。
// 対象は自分のフィード2本だけなので、これで十分です。
// ==========================================================================

/**
 * XMLタグの中身を取り出す
 * 例: getTag("<title>あああ</title>", "title") → "あああ"
 */
function getTag(xml, tagName) {
	const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`);
	const matched = xml.match(pattern);
	return matched ? matched[1] : null;
}

/**
 * CDATA（<![CDATA[ ... ]]>）を外し、&amp; などの記号を普通の文字に戻す
 */
function decodeText(text) {
	if (!text) return "";
	return text
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;|&#0?39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&amp;/g, "&") // これは必ず最後に行う
		.trim();
}

/**
 * 説明文からHTMLタグを取り除き、長すぎる場合は切り詰める
 */
function toPlainText(html, maxLength = 90) {
	const text = decodeText(html)
		.replace(/<[^>]*>/g, "") // HTMLタグを除去
		.replace(/\s+/g, " ") // 改行や連続する空白を1つにまとめる
		.trim();

	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * 日付を "2026-08-16" の形にそろえる
 */
function toIsoDate(pubDate) {
	if (!pubDate) return null;
	const parsed = new Date(decodeText(pubDate));
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toISOString().slice(0, 10);
}

/**
 * 画面に出す日付の表記をそろえる
 *   "2026-08-16" → "2026.08.16"
 * 紙面らしく点でそろえた表記にします。
 */
export function formatDate(value) {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return `${parsed.getFullYear()}.${month}.${day}`;
}

/**
 * RSSフィードを読み込んで、記事・エピソードの配列を返す
 *
 * @param {string|null} feedUrl  RSSのURL（src/data/site.js で管理）
 * @param {number} limit         取り出す件数
 * @returns {Promise<Array<{title, date, url, description}>>}
 *
 * 取得に失敗しても「空の配列」を返すだけで、ビルドは止まりません。
 * （ネットが不安定なときにサイトが作れなくなるのを避けるためです）
 */
export async function fetchFeedItems(feedUrl, limit = 3) {
	if (!feedUrl) return [];

	try {
		// 20秒以内に応答がなければあきらめる
		const response = await fetch(feedUrl, {
			signal: AbortSignal.timeout(20000),
			headers: { "User-Agent": "digikoku-site" },
		});

		if (!response.ok) {
			console.warn(`[feeds] 取得できませんでした（HTTP ${response.status}）: ${feedUrl}`);
			return [];
		}

		const xml = await response.text();

		// <item> ごとに切り分ける（先頭は番組情報なので捨てる）
		const rawItems = xml.split("<item>").slice(1);

		return rawItems.slice(0, limit).map((rawItem) => ({
			title: decodeText(getTag(rawItem, "title")),
			date: toIsoDate(getTag(rawItem, "pubDate")),
			url: decodeText(getTag(rawItem, "link")) || null,
			description: toPlainText(getTag(rawItem, "description")),
		}));
	} catch (error) {
		console.warn(`[feeds] 取得に失敗しました: ${feedUrl}`);
		console.warn(`        ${error.message}`);
		return [];
	}
}
