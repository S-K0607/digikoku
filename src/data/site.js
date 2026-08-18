// ==========================================================================
// サイト全体で共通して使う情報をまとめたファイル
//
// ここを1か所書き換えれば、Header・Footer・各ページの表示がまとめて変わります。
// 「外部サービスのURL」と「サイトの名前・説明」だけを置いています。
// 各ページ固有の内容（エピソード一覧など）は、それぞれのページの中に書いています。
// ==========================================================================

/**
 * サイトの基本情報
 */
export const site = {
	// 短いブランド名。サイト上でいちばん強く見せる名前
	name: "デジ国",
	// 英字表記（補助的にのみ使う）
	nameEn: "DIGIKOKU",
	// サイトの副題。ヘッダー・Hero・フッターのブランド表示に使います。
	// 「〜を語ろう」はPodcastの番組名なので、サイトの副題には含めません。
	subtitle: "デジタル時代の国語教育",
	// Podcastの番組名（Podcastの紹介で使います）
	fullName: "デジタル時代の国語教育を語ろう",
	// <title> のベース
	title: "デジ国｜デジタル時代の国語教育を語ろう",
	// meta description のベース
	description:
		"国語教育、ICT、生成AI、探究、学校について、Podcast・Voicy・noteを通して発信する「デジ国」の公式サイト。",
	// 発信者
	author: "Kasahara Satoru",
	// Copyright に使う開始年（Podcast第1回の配信年）
	startYear: 2024,
};

/**
 * 外部サービスへのリンク
 *
 * URLを変えたいときは、ここだけを書き換えてください。
 * url を null にすると、その項目は「URL未設定（仮）」と表示されリンクになりません。
 */
export const links = {
	// --- Podcast「デジタル時代の国語教育を語ろう」の配信先 ---
	podcastSpotify: {
		label: "Spotify",
		url: "https://open.spotify.com/show/39O38wNCrbo3L2iBPEEkWZ",
	},
	podcastApple: {
		label: "Apple Podcasts",
		url: "https://podcasts.apple.com/jp/podcast/id1759366261",
	},
	podcastAmazon: {
		label: "Amazon Music",
		url: "https://music.amazon.co.jp/podcasts/3884c4ac-b486-4293-9b87-66b75f9c4193",
	},
	podcastListen: {
		label: "LISTEN",
		url: "https://listen.style/p/digikoku",
	},
	podcastStandfm: {
		label: "stand.fm",
		url: "https://stand.fm/channels/6698777b366ee42128ad2540",
	},
	// PodcastのRSSフィード。
	// サイトの「最新エピソード」は、ここから自動で取得しています。
	podcastRss: {
		label: "RSS",
		url: "https://anchor.fm/s/106b07834/podcast/rss",
	},
	// Podyは「聴く場所」ではなく、エピソードを検索したり記事を読んだりしながら
	// たどるための入口です。上の配信サービス一覧とは分けて案内しています。
	podcastPody: {
		label: "Podyで番組を見る",
		url: "https://pody.jp/player/G9xsfgAIbg9uxBh5cFZz",
	},

	// --- Voicy「デジタル時代の国語教育ラジオ」 ---
	voicy: {
		label: "Voicyで聴く",
		url: "https://voicy.jp/channel/893814",
	},

	// --- note ---
	note: {
		label: "noteを読む",
		url: "https://note.com/skasahara",
	},
	// noteのRSSフィード。
	// サイトの「最新記事」は、ここから自動で取得しています。
	noteRss: {
		label: "note RSS",
		url: "https://note.com/skasahara/rss",
	},

	// --- 研究業績 ---
	researchmap: {
		label: "researchmapで研究業績を見る",
		url: "https://researchmap.jp/satoru_kasahara",
	},

	// --- 研究者ディレクトリ ---
	googleDirectory: {
		label: "Google for Education Directory",
		url: "https://edudirectory.withgoogle.com/profiles/6132879479275520",
	},

	// --- SNS・その他 ---
	x: {
		label: "X（旧Twitter）",
		url: "https://x.com/skshr_kokugo",
	},
	youtube: {
		label: "YouTube",
		url: "https://www.youtube.com/@GoogleforEducation-mk5hm",
	},
	litlink: {
		label: "lit.link（リンクまとめ）",
		url: "https://lit.link/kasaharasatoru",
	},
	// お問い合わせフォーム（匿名可・メールアドレス不要）
	contactForm: {
		label: "お問い合わせフォームを開く",
		url: "https://docs.google.com/forms/d/e/1FAIpQLSfJO7WWWd2GMDSHMkRSOxrYBHBWputpkdFdNGN66WShYY9-9w/viewform",
	},
};

/**
 * 連絡先メールアドレス
 *
 * スパム対策のため、"skasaharagfe@gmail.com" という文字列を
 * そのままHTMLに書きません。ユーザー名とドメインを分けて持ち、
 * ブラウザ側で組み立てて表示します。
 * （メール収集プログラムはHTMLの文字列を読むだけなので、これで拾われにくくなります）
 */
export const contactEmail = {
	user: "skasaharagfe",
	domain: "gmail.com",
};

/**
 * サイト内のページ一覧
 * Header のナビゲーションと Footer の両方でこの配列を使っています。
 * ページを増やしたら、ここに1行足せばナビゲーションにも出ます。
 */
export const navigation = [
	{ label: "Home", href: "/" },
	{ label: "Podcast", href: "/podcast/" },
	{ label: "Voicy", href: "/voicy/" },
	{ label: "note", href: "/note/" },
	{ label: "教育系ポッドキャストの日", href: "/podcast-day/" },
	{ label: "About", href: "/about/" },
	{ label: "お問い合わせ", href: "/contact/" },
];

/**
 * Podcastアートワークの説明文（alt属性）
 * 画像そのものは src/components/Picture.astro が表示しています。
 */
export const artwork = {
	alt: "Podcast「デジタル時代の国語教育を語ろう」のアートワーク。マイクの前で話す男性、本、吹き出し、デジタル回路が描かれた濃紺のイラスト。",
};
