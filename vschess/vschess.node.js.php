<?php
error_reporting(0);
date_default_timezone_set('Asia/Shanghai');
header('Content-type: application/x-javascript; charset=utf-8');
include 'develop/class.JavaScriptPacker.php';

$version = '2.6.6';
$developList = scandir('develop/module');
unset($developList[0], $developList[1]);

$module[] = 'main.js';
$module[] = 'config.js';

$exclude = ['function.load.js', 'function.IE6.js', 'function.init.js', 'function.iconv.v1.js'];

foreach ($developList as $filename) {
	if (in_array($filename, $exclude, true)) {
		continue;
	}

	if (strpos($filename, 'function.') !== false) {
		$module[] = $filename;
	}
}

$module[] = 'final.node.js';

foreach ($module as $filename) {
	$filemtime = filemtime("develop/module/{$filename}");

	if ($edittime < $filemtime) {
		$edittime = $filemtime;
	}
}

$jsBegin = '
/*
 * 微思象棋函数库 V'. $version. '
 * https://www.xiaxiangqi.com/
 *
 * Copyright @ 2009-'. date('Y'). ' Margin.Top 版权所有
 * https://margin.top/
 *
 * 本程序遵循 LGPL 协议
 * https://www.gnu.org/licenses/lgpl.html
 *
 * 鸣谢列表敬请移步 GitHub 项目主页，排名不分先后
 * https://github.com/FastLight126/vschess
 *
 * 最后修改日期：北京时间 '. date('Y年n月j日', $edittime). '
 * '. date('r', $edittime). '
 */';

foreach ($module as $filename) {
	$code = file_get_contents("develop/module/{$filename}");
	$code = str_replace('#VERSION#', $version, $code);
	$code = str_replace('#TIMESTAMP#', date('r', $edittime), $code);
	$code = str_replace('#YEAR#', date('Y'), $code);
	$code = str_replace('http://', 'http:##', $code);
	$code = str_replace('https://', 'https:##', $code);
	$code = str_replace('$.trim', 'vs.trim', $code);
	$code = str_replace('vs.', 'vschess.', $code);
	$jsMain .= "/*** {$filename} ***/\n". trim($code). "\n\n";
}

$jsMainLines = explode("\n", $jsMain);

foreach ($jsMainLines as $line) {
	$lineSplitByComment = explode('//', $line);
	$comment = count($lineSplitByComment) > 1 ? '//'. array_pop($lineSplitByComment) : '';
	$lineWords = mb_str_split(implode('//', $lineSplitByComment));

	foreach ($lineWords as &$word) {
		strlen($word) > 1 && $word = substr(json_encode($word), 1, -1);
	}

	$jsMainCovert[] = implode('', $lineWords). $comment;
}

$jsMainCovert = implode("\n", $jsMainCovert);
$jsMainCovert = str_replace('http:##', 'http://', $jsMainCovert);
$jsMainCovert = str_replace('https:##', 'https://', $jsMainCovert);
$javascript = trim($jsBegin. "\n\n". trim($jsMainCovert). "\n");
file_put_contents('vschess.function.js', preg_replace('/\\/\\*\\*\\*(.*)\\*\\*\\*\\/\\n/', '', $javascript));

function mb_str_split($str) {
	$index = 0;
	$length = strlen($str);

	while ($index < $length) {
		$arr[] = ord($str[$index]) > 127 ? $str[$index++]. $str[$index++]. $str[$index++] : $str[$index++];
	}

	return $arr;
}
