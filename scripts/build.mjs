// ==========================================================================
// scripts/build.mjs  ―  `npm run build` から呼ばれるビルド用スクリプト
//
// 【なぜこのスクリプトが必要か】
// Windows環境でプロジェクトが日本語を含むパス（例: 日本語フォルダ名など）にある場合、
// Astro が内部で使うバンドラー（Rolldown／Rust製）は、Windows で
// 日本語を含むパスを処理できず、エラーメッセージも出さずに異常終了します。
// そのため `astro build` がそのままでは失敗します。
//
// 【どう回避しているか】
// 英数字だけの一時フォルダへソース一式をコピーし、そちらでビルドして、
// できあがった dist/ だけをプロジェクトへ戻しています。
//
//   %TEMP%\digikoku-build\
//     ├─ src, public, 設定ファイル … 実体をコピー（robocopyで差分のみ）
//     ├─ node_modules             … 別名（ジャンクション）。コピーしないので速い
//     └─ dist                     … ここで生成 → プロジェクトへ戻す
//
// ── 試したが うまくいかなかった方法（同じ失敗を繰り返さないための記録）──
//   ・プロジェクト全体をジャンクションにしてビルド
//       → ビルドは通るが CSS が1つも出力されない（無スタイルのサイトになる）
//   ・vite の resolve.preserveSymlinks を有効にする
//       → 同じくCSSが出力されない
//   ・Node の fs.cpSync でコピー
//       → 同期フォルダ配下等で異常終了することがある。そのため robocopy を使用
//
// 【GitHub Actions（Linux）で動かす場合】
// 回避処理は Windows のときだけ動きます。Linux では下の分岐で
// そのまま通常の `astro build` を実行します（コピーもジャンクションもしません）。
//
// プロジェクトを英数字だけのパスに移動すれば、この回避は不要になり、
// このスクリプトは自動的に通常のビルドに切り替わります。
// ==========================================================================

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, realpathSync, rmdirSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const projectRoot = process.cwd();

/** 半角の英数記号だけで構成されているか（日本語などが含まれていないか） */
const isAscii = (text) => /^[\x20-\x7E]*$/.test(text);

/** 指定フォルダを作業ディレクトリにして astro build を実行する */
function runAstroBuild(workingDir) {
	const astroBin = join(workingDir, "node_modules", "astro", "bin", "astro.mjs");
	return spawnSync(process.execPath, [astroBin, "build"], {
		cwd: workingDir,
		stdio: "inherit",
	});
}

// --- 回避が不要な場合は、そのまま普通にビルドして終了 --------------------
// 当てはまるのは次の2通り。
//   ・Windows以外（GitHub Actions の Linux など）
//   ・Windowsだが、パスに日本語が含まれていない
const isWindows = process.platform === "win32";

if (!isWindows || isAscii(projectRoot)) {
	if (!isWindows) {
		console.log("[build] Windows以外の環境のため、通常のビルドを実行します。");
	}
	const result = runAstroBuild(projectRoot);
	process.exit(result.status ?? 1);
}

// ==========================================================================
// ここから下は「Windows かつ 日本語を含むパス」の場合だけ
// ==========================================================================

const workDir = join(os.tmpdir(), "digikoku-build");

if (!isAscii(workDir)) {
	console.error(
		"\n[build] 英数字だけの一時フォルダを用意できませんでした。\n" +
			`        一時フォルダ: ${workDir}\n` +
			"        プロジェクトを英数字だけのパスへ移動してからビルドしてください。\n"
	);
	process.exit(1);
}

/**
 * robocopy でフォルダを丸ごと同期する（Windows標準のコマンド）
 * /MIR … コピー元と同じ状態にする（差分だけコピーするので2回目以降が速い）
 * robocopy は「成功でも 0以外」を返す仕様で、0〜7 が正常、8以上が失敗です。
 */
function mirror(from, to, excludeDirs = []) {
	const args = [from, to, "/MIR", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS", "/NP"];
	if (excludeDirs.length > 0) args.push("/XD", ...excludeDirs);

	const result = spawnSync("robocopy", args, { stdio: "pipe" });
	const code = result.status ?? 16;

	if (code >= 8) {
		console.error(`\n[build] コピーに失敗しました（robocopy ${code}）\n  ${from}\n  → ${to}\n`);
		console.error(String(result.stdout || result.stderr || ""));
		process.exit(1);
	}
}

console.log("[build] 日本語パスを回避してビルドします…");

mkdirSync(workDir, { recursive: true });

// --- 1. ソース一式を一時フォルダへ同期 ------------------------------------
// node_modules … 下でジャンクションを作るのでコピーしない
// dist          … 一時フォルダ側で作られるので触らない
// .git/.astro/assets … ビルドに不要
mirror(projectRoot, workDir, ["node_modules", "dist", ".git", ".astro", "assets"]);

// --- 2. node_modules は「別名」で参照する（コピーすると重いため）---------
const linkedModules = join(workDir, "node_modules");
const realModules = join(projectRoot, "node_modules");

if (existsSync(linkedModules)) {
	// すでにある場合、正しい場所を指しているか確認します。
	// 普通のフォルダだった場合は、誤って消さないようここで中止します。
	const stat = lstatSync(linkedModules);
	if (!stat.isSymbolicLink()) {
		console.error(
			`\n[build] ${linkedModules} が別名ではありません。手動で削除してから再実行してください。\n`
		);
		process.exit(1);
	}
	if (realpathSync(linkedModules) !== realpathSync(realModules)) {
		// 別の場所を指していたら、別名だけを外して作り直します
		// （rmdir は別名を外すだけで、リンク先の中身は消しません）
		rmdirSync(linkedModules);
	}
}

if (!existsSync(linkedModules)) {
	const link = spawnSync("cmd", ["/c", "mklink", "/J", linkedModules, realModules], {
		stdio: "pipe",
	});
	if (link.status !== 0) {
		console.error(
			"\n[build] node_modules の別名（ジャンクション）を作成できませんでした。\n" +
				"        プロジェクトを英数字だけのパスへ移動してからビルドしてください。\n"
		);
		console.error(String(link.stderr || ""));
		process.exit(1);
	}
}

// --- 3. 一時フォルダでビルド ----------------------------------------------
const result = runAstroBuild(workDir);

if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

// --- 4. できあがった dist/ をプロジェクトへ戻す ---------------------------
const builtDist = join(workDir, "dist");
const projectDist = join(projectRoot, "dist");

if (!existsSync(builtDist)) {
	console.error("\n[build] dist/ が生成されませんでした。\n");
	process.exit(1);
}

mirror(builtDist, projectDist);

console.log(`[build] dist/ を書き出しました → ${projectDist}`);
