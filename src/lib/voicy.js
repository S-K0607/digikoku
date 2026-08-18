// ==========================================================================
// voicy.js  ―  Voicyの放送データを扱うための小さな道具
//
// 「10分以内かどうか」の判定を、ページに出す件数（ビルド時）と
// 実際の抽選（ブラウザ側）の両方で使うため、ここ1か所にまとめています。
// 基準を変えたいときは、このファイルの SHORT_LIMIT_SECONDS だけを直します。
// ==========================================================================

/** 「10分以内」の境目（秒） */
export const SHORT_LIMIT_SECONDS = 600;

/**
 * 放送尺を秒数に直す
 * 例: "0:10:14" → 614
 */
export function toSeconds(duration) {
	return duration.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

/** 10分以内の放送かどうか */
export function isShort(episode) {
	return toSeconds(episode.duration) <= SHORT_LIMIT_SECONDS;
}
